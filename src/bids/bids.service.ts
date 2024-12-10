import { UsersService } from '../users/users.service';

import { DomainsService } from '../domains/domains.service';

import { AuctionsService } from '../auctions/auctions.service';

import { MailService } from '../mail/mail.service';

import { HttpStatus, UnprocessableEntityException } from '@nestjs/common';

import { Injectable } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { BidRepository } from './infrastructure/persistence/bid.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Bid } from './domain/bid';
import { DataSource, QueryRunner } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { BidEntity } from './infrastructure/persistence/relational/entities/bid.entity';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { DomainEntity } from '../domains/infrastructure/persistence/relational/entities/domain.entity';
import { AuctionEntity } from '../auctions/infrastructure/persistence/relational/entities/auction.entity';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { PaymentEntity } from '../payments/infrastructure/persistence/relational/entities/payment.entity';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { PaymentsService } from '../payments/payments.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class BidsService {
  private stripe: Stripe;
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,

    private readonly userService: UsersService,

    private readonly domainService: DomainsService,

    private readonly auctionService: AuctionsService,

    private readonly paymentService: PaymentsService,

    private mailService: MailService,

    private readonly configService: ConfigService<AllConfigType>,

    private readonly settingsService: SettingsService,

    // Dependencies here
    private readonly bidRepository: BidRepository,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (this.stripe = new Stripe(
      this.configService.getOrThrow('payment.stripeSecretKey', { infer: true }),
    )),
      {
        apiVersion: '2022-11-15',
      };
  }

  async create(createBidDto: CreateBidDto) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      // **Validate and fetch related entities**
      const user_id = await this.userService.findById(createBidDto.user_id);
      if (!user_id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { user_id: 'notExists' },
        });
      }

      const domain_id = await this.domainService.findById(
        createBidDto.domain_id,
      );
      if (!domain_id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { domain_id: 'notExists' },
        });
      }

      const auction_id = await this.auctionService.findById(
        createBidDto.auction_id,
      );
      if (!auction_id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { auction_id: 'notExists' },
        });
      }

      // // **Fetch the previous highest bid within the current auction**
      const previousHighestBid = await this.bidRepository.findHighestBidder(
        auction_id.id,
      );

      // **Auction time validation**
      const currentTime = new Date();
      if (auction_id.start_time && currentTime < auction_id.start_time) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { auction: 'notStarted' },
        });
      }

      if (
        (auction_id.end_time && currentTime > auction_id.end_time) ||
        auction_id.status === 'LEASE_PENDING'
      ) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { auction: 'hasEnded' },
        });
      }

      // **Reserve price check if it's the first bid**
      if (
        (domain_id.current_highest_bid === null ||
          Number(domain_id.current_highest_bid) === 0) &&
        createBidDto.amount <= Number(auction_id.min_price)
      ) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            amount: 'mustBeGreaterThanMinimumPrice',
            reservePrice: auction_id.min_price,
          },
        });
      }

      // **Bid amount validation**
      const minIncrement = Number(auction_id.min_increment) || 0;
      const currentHighestBid = Number(domain_id.current_highest_bid) || 0;

      if (createBidDto.amount <= currentHighestBid + minIncrement) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            amount: 'mustBeGreaterThanCurrentBidByMinIncrement',
            currentHighestBid,
            minIncrement,
          },
        });
      }

      // **Create bid**: Now that user_id, domain_id, and auction_id are resolved, create the bid entity
      const newBid = manager.create(BidEntity, {
        amount: createBidDto.amount,
        user_id: user_id as UserEntity,
        domain_id: domain_id as DomainEntity,
        auction_id: auction_id as AuctionEntity,
      });

      // Save the new bid
      await manager.save(newBid);

      // **Update domain status if it's the first bid**
      const domainRepository = queryRunner.manager.getRepository(DomainEntity);
      await domainRepository.update(domain_id.id, {
        current_highest_bid: createBidDto.amount,
        status: domain_id.current_highest_bid
          ? domain_id.status
          : 'BID_RECEIVED',
      });

      // **Update domain status if it's the first bid**
      const auctionRepository =
        queryRunner.manager.getRepository(AuctionEntity);
      await auctionRepository.update(auction_id.id, {
        status: domain_id.current_highest_bid ? auction_id.status : 'ACTIVE',
      });

      // **Commit the transaction**
      await queryRunner.commitTransaction();

      // **Send email to the previous highest bidder if they exist**
      // **Check if there was a previous highest bid**
      if (previousHighestBid && previousHighestBid.user_id.email) {
        console.log(previousHighestBid);
        void this.mailService.outBid({
          to: previousHighestBid.user_id.email,
          data: {
            domaiName: domain_id.url,
            userBidAmount: previousHighestBid.amount, // This is the previous highest bid amount
            auctionEndTime: auction_id.end_time,
            currentHighestBid: createBidDto.amount, // This is the new current bid amount
            firstName: previousHighestBid.user_id.first_name ?? 'User',
          },
        });
      }

      // **Refetch to get updated data with limited fields**
      const createdBid = await this.bidRepository.findById(newBid.id);

      return createdBid;
    } catch (error) {
      // **Rollback the transaction in case of error**
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // **Release the query runner to avoid memory leaks**
      await queryRunner.release();
    }
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.bidRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Bid['id']) {
    return this.bidRepository.findById(id);
  }

  findByIds(ids: Bid['id'][]) {
    return this.bidRepository.findByIds(ids);
  }

  update(
    id: Bid['id'],

    updateBidDto: UpdateBidDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    console.log(id);

    console.log(updateBidDto);
  }

  remove(id: Bid['id']) {
    return this.bidRepository.remove(id);
  }

  async findHighestBidder(auctioId: string) {
    return this.bidRepository.findHighestBidder(auctioId);
  }

  async findNextHighestBidder(auctioId: string, currentHighestAmount: number) {
    return this.bidRepository.findNextHighestBidder(
      auctioId,
      currentHighestAmount,
    );
  }

  private filterBidsResponse(bids: Bid[]) {
    return bids.map((bid) => {
      const { auction_id, user_id, domain_id, ...otherBidFields } = bid;
      const { status, ...otherAuctionFields } = auction_id; // Exclude only `status`
      const { current_winner } = auction_id;

      let bid_status: string;

      switch (status) {
        case 'ACTIVE':
          bid_status = 'ACTIVE';
          break;
        case 'FAILED':
        case 'ENDED':
        case 'LEASE_PENDING':
          bid_status = 'ENDED';
          break;
        case 'PAYMENT_PROCESSING':
        case 'PAYMENT_PENDING':
        case 'PAYMENT_SUCCESSFUL':
          bid_status = current_winner === user_id.id ? status : 'ENDED';
          break;
        default:
          bid_status = 'UNKNOWN';
      }

      return {
        ...otherBidFields,
        auction_id: {
          ...otherAuctionFields,
        },
        bid_status,
        url: domain_id.url,
        domain_id: domain_id.id,
      };
    });
  }

  async findMyBidsWithPagination(
    {
      paginationOptions,
    }: {
      paginationOptions: IPaginationOptions;
    },
    userId: string,
  ) {
    const myBid = await this.bidRepository.findMyBidWithPagination(
      {
        paginationOptions: {
          page: paginationOptions.page,
          limit: paginationOptions.limit,
        },
      },
      userId,
    );

    return this.filterBidsResponse(myBid);
  }

  async leaseNow(createLeaseDto: CreateLeaseDto, userId: string) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      // **Validate and fetch related entities**
      const user_id = await this.userService.findById(userId);
      if (!user_id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { user_id: 'notExists' },
        });
      }

      const domain_id = await this.domainService.findById(
        createLeaseDto.domain_id,
      );
      if (!domain_id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { domain_id: 'notExists' },
        });
      }

      const auction_id = await this.auctionService.findById(
        createLeaseDto.auction_id,
      );
      if (!auction_id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { auction_id: 'notExists' },
        });
      }

      if (auction_id.status === 'LEASE_PENDING') {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { auction_id: 'leaseOngoing' },
        });
      }

      const settingsKey = 'LEASE_PRICE_THRESHOLD_PERCENTAGE';
      const settingsConfig = await this.settingsService.findByKey(settingsKey);

      const leaseThreshold = Number(settingsConfig?.value) / 100 || 80;

      const leaseValue = Number(auction_id.lease_price) * leaseThreshold;

      // // **Fetch the previous highest bid within the current auction**
      const previousHighestBid = await this.bidRepository.findHighestBidder(
        auction_id.id,
      );

      if (Number(previousHighestBid?.amount) > leaseValue) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { domain_id: 'leaseNotAvailable' },
        });
      }
      const url = new URL(
        this.configService.getOrThrow('app.frontendDomain', {
          infer: true,
        }),
      );

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'GBP',
              product_data: {
                name: `Payment for ${domain_id.url}`,
              },
              unit_amount: auction_id.lease_price * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${url}/payment/success`,
        cancel_url: `${url}/payment/cancel`,
      });

      console.log(session);

      // **Create bid**: Now that user_id, domain_id, and auction_id are resolved, create the bid entity
      const newPayment = manager.create(PaymentEntity, {
        user_id: user_id as UserEntity,
        amount: auction_id.lease_price,
        // bid_id: createPaymentDto.bid_id as BidEntity,
        status: 'PROCESSING',
        stripe_id: session.id,
      });

      // Save the new bid
      await manager.save(newPayment);

      // **Update domain status if it's the first bid**
      const domainRepository = queryRunner.manager.getRepository(DomainEntity);
      await domainRepository.update(domain_id.id, {
        status: 'LEASE_PENDING',
      });

      // **Update domain status if it's the first bid**
      const auctionRepository =
        queryRunner.manager.getRepository(AuctionEntity);
      await auctionRepository.update(auction_id.id, {
        status: 'LEASE_PENDING',
      });

      // **Commit the transaction**
      await queryRunner.commitTransaction();

      //const getPayment = await this.paymentService.findById(newPayment.id);
      return { payment_url: session.url };
    } catch (error) {
      // **Rollback the transaction in case of error**
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // **Release the query runner to avoid memory leaks**
      await queryRunner.release();
    }
  }
}
