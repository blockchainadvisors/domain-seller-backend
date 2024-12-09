import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { DomainsService } from '../domains/domains.service';
import { PaymentsService } from '../payments/payments.service';
import { BidsService } from '../bids/bids.service';
import { SettingsService } from '../settings/settings.service';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { Auction } from './domain/auction';
import { Payment } from '../payments/domain/payment';
import { console } from 'inspector';

@Injectable()
export class AuctionSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(AuctionSchedulerService.name);

  // 10 minutes interval (you can adjust this based on your needs)
  private readonly interval = 10 * 60 * 1000;

  constructor(
    private readonly auctionService: AuctionsService,
    private readonly domainService: DomainsService,
    private readonly paymentService: PaymentsService,
    private readonly bidsService: BidsService,
    private readonly settingsService: SettingsService,
  ) {}

  onModuleInit() {
    // Trigger initial auction status check on startup
    void this.initAuctionStatusCheck();
    void this.processPendingPaymentsCheck();
  }

  private async processPendingPaymentsCheck() {
    await this.processPendingPayments();

    // Schedule the task to run every 10 minutes
    setInterval(async () => {
      this.logger.warn('Running scheduled job for `pending payment`...');
      await this.processPendingPayments();
    }, this.interval);
  }

  private async initAuctionStatusCheck() {
    await this.checkAuctionStatuses();

    // Schedule the task to run every 10 minutes
    setInterval(async () => {
      this.logger.warn('Running scheduled job for `checkAuctionStatuses`...');
      await this.checkAuctionStatuses();
    }, this.interval);
  }

  // Method to check and update auction statuses
  private async checkAuctionStatuses() {
    try {
      const auctions = await this.auctionService.getAuctionsForProcessing();

      console.log('auctions', auctions.length);
      for (const auction of auctions) {
        const currentTime = new Date();

        // **If the auction is in DRAFT status and the start time has reached**
        if (auction.status === 'DRAFT' && auction.start_time <= currentTime) {
          await this.auctionService.updateStatus(auction.id, 'ACTIVE');
          if (auction.domain_id.status === 'AUCTION_PENDING') {
            await this.domainService.updateStatus(
              auction.domain_id.id,
              'AUCTION_ACTIVE',
            );
          }
          this.logger.log(`Auction ${auction.id} moved from DRAFT to ACTIVE`);
        }

        // **If the auction is ACTIVE but the end time has reached**
        if (auction.status === 'ACTIVE' && auction.end_time <= currentTime) {
          await this.auctionService.updateStatus(auction.id, 'ENDED');
          await this.domainService.updateStatus(
            auction.domain_id.id,
            'AUCTION_ENDED',
          );
          this.logger.log(`Auction ${auction.id} ended`);

          // Fetch the highest bid
          const highestBid = await this.bidsService.findHighestBidder(
            auction.id,
          );

          this.logger.log(`highestBid ${highestBid}`);
          console.log(Number(highestBid?.amount));
          console.log(Number(auction.reserve_price));
          if (highestBid) {
            if (Number(highestBid.amount) >= Number(auction.reserve_price)) {
              // Create a payment record for the highest bid
              await this.paymentService.create({
                user_id: highestBid.user_id as UserEntity,
                bid_id: highestBid,
                amount: highestBid.amount,
                status: 'PENDING',
              });
              await this.auctionService.updateStatus(
                auction.id,
                'PAYMENT_PENDING',
              );
              this.logger.log(
                `Payment record created for auction ${auction.id}`,
              );
            } else {
              // Highest bid did not meet the reserve price, mark auction as FAILED
              await this.auctionService.updateStatus(auction.id, 'FAILED');
              this.logger.log(
                `Auction ${auction.id} failed as the reserve price was not met`,
              );
              await this.domainService.update(auction.domain_id.id, {
                status: 'LISTED',
                current_highest_bid: 0,
              });
            }
          } else {
            // No bids received, mark auction as FAILED
            await this.auctionService.updateStatus(auction.id, 'FAILED');
            this.logger.log(`Auction ${auction.id} failed due to no bids`);
            await this.domainService.update(auction.domain_id.id, {
              status: 'LISTED',
              current_highest_bid: 0,
            });
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error in auction status check: ${error.message}`);
    }
  }

  private async processPendingPayments() {
    try {
      console.log('settingsConfig');
      const pendingPayments =
        await this.paymentService.findAllPendingPayments();
      const settingsKey = 'PENDING_THRESHOLD_SECONDS';
      const settingsConfig = await this.settingsService.findByKey(settingsKey);

      const pendingThreshold = Number(settingsConfig?.value) || 2000;

      for (const paymentRecord of pendingPayments) {
        const isTimedOut = this.isPaymentTimedOut(
          paymentRecord.created_at,
          pendingThreshold,
        );

        if (isTimedOut) {
          const auction = await this.auctionService.findById(
            paymentRecord.bid_id.auction_id.id,
          );

          if (auction) {
            // Handle payment timeout
            await this.handlePaymentTimeout(auction, paymentRecord);
          } else {
            this.logger.error(
              `Auction not found for payment record ${paymentRecord.id}.`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Error in processing pending payments: ${error.message}`,
      );
    }
  }

  private async handlePaymentTimeout(auction: Auction, paymentRecord: Payment) {
    // Mark current payment as FAILED
    await this.paymentService.updateStatus(paymentRecord.id, 'FAILED');
    this.logger.log(
      `Payment for auction ${auction.id} by user ${paymentRecord.user_id.id} failed due to non-payment.`,
    );

    // Fetch the next highest bid
    const nextHighestBid = await this.bidsService.findNextHighestBidder(
      auction.id,
      paymentRecord.bid_id.amount,
    );

    if (
      nextHighestBid &&
      Number(nextHighestBid.amount) >= Number(auction.reserve_price)
    ) {
      // Create a payment record for the next highest bidder
      await this.paymentService.create({
        user_id: nextHighestBid.user_id as UserEntity,
        bid_id: nextHighestBid,
        amount: nextHighestBid.amount,
        status: 'PENDING',
      });

      this.logger.log(
        `Payment record created for the next highest bidder on auction ${auction.id}`,
      );
    } else {
      // No valid bids remaining, mark auction as FAILED
      await this.auctionService.updateStatus(auction.id, 'FAILED');
      this.logger.log(
        `Auction ${auction.id} failed due to no valid bids meeting the reserve price.`,
      );
      await this.domainService.updateStatus(auction.domain_id.id, 'LISTED');
    }
  }

  private isPaymentTimedOut(
    paymentCreatedAt: Date,
    pendingThreshold: number,
  ): boolean {
    console.log(pendingThreshold);
    const PENDING_THRESHOLD_SECONDS = Number(pendingThreshold);
    const currentTime = new Date();
    const timeElapsed =
      (currentTime.getTime() - paymentCreatedAt.getTime()) / 1000;

    this.logger.log(`time ${timeElapsed}, ${PENDING_THRESHOLD_SECONDS}`);
    return timeElapsed > PENDING_THRESHOLD_SECONDS;
  }
}
