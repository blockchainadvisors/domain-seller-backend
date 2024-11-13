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

@Injectable()
export class BidsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,

    private readonly userService: UsersService,

    private readonly domainService: DomainsService,

    private readonly auctionService: AuctionsService,

    private mailService: MailService,

    // Dependencies here
    private readonly bidRepository: BidRepository,
  ) {}

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

      if (auction_id.end_time && currentTime > auction_id.end_time) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { auction: 'hasEnded' },
        });
      }

      // **Reserve price check if it's the first bid**
      if (
        (domain_id.current_highest_bid === null ||
          Number(domain_id.current_highest_bid) === 0) &&
        createBidDto.amount <= Number(auction_id.reserve_price)
      ) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            amount: 'mustBeGreaterThanReservePrice',
            reservePrice: auction_id.reserve_price,
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
            firstName: user_id.first_name ?? 'User',
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
}
