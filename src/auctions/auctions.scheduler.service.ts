import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { DomainsService } from '../domains/domains.service';
import { PaymentsService } from '../payments/payments.service';
import { BidsService } from '../bids/bids.service';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';

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
  ) {}

  onModuleInit() {
    // Trigger initial auction status check on startup
    void this.initAuctionStatusCheck();
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

          if (highestBid) {
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
            this.logger.log(`Payment record created for auction ${auction.id}`);
          } else {
            // No bids received, mark auction as FAILED
            await this.auctionService.updateStatus(auction.id, 'FAILED');
            this.logger.log(`Auction ${auction.id} failed due to no bids`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error in auction status check: ${error.message}`);
    }
  }
}
