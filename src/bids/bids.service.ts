import { UsersService } from '../users/users.service';

import { DomainsService } from '../domains/domains.service';

import { AuctionsService } from '../auctions/auctions.service';

import { MailService } from '../mail/mail.service';

import {
  forwardRef,
  HttpStatus,
  Inject,
  UnprocessableEntityException,
} from '@nestjs/common';

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
import { SettingsService } from '../settings/settings.service';
import { BidLogsService } from '../bid-logs/bid-logs.service';
import { BidLogsEntity } from '../bid-logs/infrastructure/persistence/relational/entities/bid-logs.entity';
import { IncreaseBidDto } from './dto/Increase-bid.dto';
import { Auction } from '../auctions/domain/auction';

@Injectable()
export class BidsService {
  private stripe: Stripe;
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,

    private readonly userService: UsersService,

    private readonly domainService: DomainsService,

    @Inject(forwardRef(() => AuctionsService))
    private readonly auctionService: AuctionsService,

    private mailService: MailService,

    private readonly configService: ConfigService<AllConfigType>,

    private readonly settingsService: SettingsService,

    private readonly bidLogsService: BidLogsService,

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

  async create(createBidDto: CreateBidDto, retrieved_user_id: string) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      //validate user details
      if (createBidDto.user_id != retrieved_user_id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { user_id: 'userIdMismatch', message: 'User Id Mismatch' },
        });
      }

      // **Validate and fetch related entities**
      const user_id = await this.userService.findById(createBidDto.user_id);
      if (!user_id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { user_id: 'notExists', message: 'User does  not exist' },
        });
      }

      const domain_id = await this.domainService.findById(
        createBidDto.domain_id,
      );
      if (!domain_id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { domain_id: 'notExists', message: 'Domain name does exist' },
        });
      }

      const auction_id = await this.auctionService.findById(
        createBidDto.auction_id,
      );
      if (!auction_id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { auction_id: 'notExists', message: 'Auction not valid' },
        });
      }

      if (auction_id.domain_id.id != createBidDto.domain_id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            auction_id: 'domainIdMisMatch',
            message: 'Domain name Mismatch',
          },
        });
      }

      // // // **Fetch the previous highest bid within the current auction**
      // const previousHighestBid = await this.bidRepository.findHighestBidder(
      //   auction_id.id,
      // );

      // **Auction time validation**
      const currentTime = new Date();
      if (auction_id.start_time && currentTime < auction_id.start_time) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { auction: 'notStarted', message: 'Auction not started' },
        });
      }

      if (
        (auction_id.end_time && currentTime > auction_id.end_time) ||
        auction_id.status === 'LEASE_PENDING'
      ) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { auction: 'hasEnded', message: 'Auction have been leased' },
        });
      }

      const minIncrement = Number(auction_id.min_increment) || 0;
      const currentHighestBid = Number(auction_id.current_bid) || 0;

      const bid_count = await this.bidRepository.findCountByAuctionId(
        auction_id.id,
      );

      if (Number(bid_count) > 0) {
        if (
          Number(createBidDto.amount) <
          Number(auction_id.current_bid) + minIncrement
        ) {
          throw new UnprocessableEntityException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              amount: 'mustBeGreaterThanCurrentBidByMinIncrement',
              message: `Bid amount must be greater than current bid plus minimum increament ${minIncrement}`,
              currentHighestBid,
              minIncrement,
            },
          });
        }
      }
      if (Number(bid_count) === 0) {
        // **Update domain status if it's the first bid**
        const valid_current_bid =
          Number(createBidDto.amount) > Number(auction_id.reserve_price)
            ? auction_id.reserve_price
            : auction_id.min_price;

        const domainRepository =
          queryRunner.manager.getRepository(DomainEntity);
        await domainRepository.update(domain_id.id, {
          current_highest_bid: valid_current_bid,
          status: 'BID_RECEIVED',
        });

        const newBid = manager.create(BidEntity, {
          amount: Number(createBidDto.amount),
          user_id: user_id as UserEntity,
          domain_id: domain_id as DomainEntity,
          auction_id: auction_id as AuctionEntity,
          created_by_method: 'USER',
          current_bid: valid_current_bid,
        });
        // Save the new bid
        await manager.save(newBid);
        // **Update domain status if it's the first bid**
        const auctionRepository =
          queryRunner.manager.getRepository(AuctionEntity);
        await auctionRepository.update(auction_id.id, {
          status: 'ACTIVE',
          current_bid: valid_current_bid,
          highest_bid: Number(createBidDto.amount),
          current_winner: retrieved_user_id,
          winning_bid_id: newBid.id,
        });

        // log the starter
        const newBidLogs = manager.create(BidLogsEntity, {
          amount: Number(auction_id.min_price),
          bidder: 'Starting Price',
          bid_id: newBid,
        });

        // log the current bid

        const newBidLogs2 = manager.create(BidLogsEntity, {
          amount: Number(valid_current_bid),
          bidder: retrieved_user_id,
          bid_id: newBid,
        });
        await manager.save(newBidLogs);
        await manager.save(newBidLogs2);
      } else {
        //check current_max_bid(30.5)  is higher more than the current_winner_max_bid(30)

        if (createBidDto.amount > Number(auction_id.highest_bid)) {
          const highestBid = Number(auction_id.highest_bid);
          const minIncrement = Number(auction_id.min_increment);
          const reservePrice = Number(auction_id.reserve_price);
          const currentBid = Number(auction_id.current_bid);
          const userBid = Number(createBidDto.amount);

          const maxBidAllowed = highestBid + minIncrement; // Maximum possible bid
          let validCurrentBid: number;

          if (userBid >= reservePrice && currentBid < reservePrice) {
            // Case: User's bid meets reserve price and current bid is below reserve
            validCurrentBid = Math.max(
              reservePrice,
              Math.min(maxBidAllowed, userBid),
            );
          } else {
            // General case: No special reserve price condition
            validCurrentBid = Math.min(maxBidAllowed, userBid);
          }

          // Save the new bid
          const newBid = manager.create(BidEntity, {
            amount: createBidDto.amount,
            user_id: user_id as UserEntity,
            domain_id: domain_id as DomainEntity,
            auction_id: auction_id as AuctionEntity,
            created_by_method: 'USER',
            current_bid: validCurrentBid,
          });

          await manager.save(newBid);

          // **Update action**
          const auctionRepository =
            queryRunner.manager.getRepository(AuctionEntity);
          await auctionRepository.update(auction_id.id, {
            current_bid: validCurrentBid,
            highest_bid: createBidDto.amount,
            current_winner: retrieved_user_id,
            winning_bid_id: newBid.id,
          });

          // update domain table
          const domainRepository =
            queryRunner.manager.getRepository(DomainEntity);
          await domainRepository.update(domain_id.id, {
            current_highest_bid: validCurrentBid,
          });
          const newBidLogs = manager.create(BidLogsEntity, {
            amount: validCurrentBid,
            bidder: retrieved_user_id,
            bid_id: newBid,
          });

          await manager.save(newBidLogs);

          // send email to prvious winner
          const previous_highest_user = await this.userService.findById(
            auction_id.current_winner!,
          );
          if (!previous_highest_user) {
            console.log('No previous winner');
          } else {
            void this.mailService.outBid({
              to: previous_highest_user.email!,
              data: {
                domaiName: domain_id.url,
                userBidAmount: auction_id.highest_bid, // This is the previous highest bid amount
                auctionEndTime: auction_id.end_time,
                currentHighestBid: createBidDto.amount, // This is the new current bid amount
                firstName: previous_highest_user.first_name ?? 'User',
              },
            });
          }
        } else {
          const userBid = Number(createBidDto.amount);
          const minIncrement = Number(auction_id.min_increment);
          const highestBid = Number(auction_id.highest_bid);
          const reservePrice = Number(auction_id.reserve_price);
          const currentBid = Number(auction_id.current_bid);

          const maxUserBid = userBid + minIncrement; // User's bid + minimum increment
          let validCurrentBid: number;

          if (userBid >= reservePrice && currentBid < reservePrice) {
            // Case: User's bid meets reserve price and current bid is below reserve
            validCurrentBid = Math.max(
              reservePrice,
              Math.min(maxUserBid, highestBid),
            );
          } else {
            // General case: User's bid is less than the current highest amount
            validCurrentBid = Math.min(maxUserBid, highestBid);
          }

          // **Update domain status if it's the first bid**
          const auctionRepository =
            queryRunner.manager.getRepository(AuctionEntity);
          await auctionRepository.update(auction_id.id, {
            current_bid: validCurrentBid,
          });

          const newBid = manager.create(BidEntity, {
            amount: createBidDto.amount,
            user_id: user_id as UserEntity,
            domain_id: domain_id as DomainEntity,
            auction_id: auction_id as AuctionEntity,
            created_by_method: 'USER',
            current_bid: validCurrentBid,
          });
          // Save the new bid
          await manager.save(newBid);

          const newBidLogs = manager.create(BidLogsEntity, {
            amount: Number(createBidDto.amount),
            bidder: retrieved_user_id,
            bid_id: newBid,
          });

          const newBidLogs2 = manager.create(BidLogsEntity, {
            amount: validCurrentBid,
            bidder: auction_id.current_winner,
            bid_id: newBid,
          });

          await manager.save(newBidLogs);

          await manager.save(newBidLogs2);
          // update domain table
          const domainRepository =
            queryRunner.manager.getRepository(DomainEntity);
          await domainRepository.update(domain_id.id, {
            current_highest_bid: validCurrentBid,
          });
        }
      }

      // **Commit the transaction**
      await queryRunner.commitTransaction();
      // **Refetch to get updated data with limited fields**
      // const createdBid = await this.bidRepository.findById(newBid.id);

      return { message: 'Successful' };
    } catch (error) {
      // **Rollback the transaction in case of error**
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // **Release the query runner to avoid memory leaks**
      await queryRunner.release();
    }
  }

  async increaseBid(
    id: Bid['id'],
    increaseBidDto: IncreaseBidDto,
    user_id: string,
  ) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      // // **Validate and fetch related entities**
      // const user = await this.userService.findById(user_id);
      // if (!user) {
      //   throw new UnprocessableEntityException({
      //     status: HttpStatus.UNPROCESSABLE_ENTITY,
      //     errors: { user_id: 'usernotExists', message: 'User does not exist' },
      //   });
      // }

      // const auction = await this.auctionService.findById(
      //   increaseBidDto.auction_id,
      // );
      // if (!auction) {
      //   throw new UnprocessableEntityException({
      //     status: HttpStatus.UNPROCESSABLE_ENTITY,
      //     errors: { auction: 'notExists', message: 'Auction not valid' },
      //   });
      // }
      // // **Auction time validation**
      // const currentTime = new Date();
      // if (auction.start_time && currentTime < auction.start_time) {
      //   throw new UnprocessableEntityException({
      //     status: HttpStatus.UNPROCESSABLE_ENTITY,
      //     errors: { auction: 'notStarted', message: 'Auction not started' },
      //   });
      // }

      // if (
      //   (auction.end_time && currentTime > auction.end_time) ||
      //   auction.status === 'LEASE_PENDING'
      // ) {
      //   throw new UnprocessableEntityException({
      //     status: HttpStatus.UNPROCESSABLE_ENTITY,
      //     errors: { auction: 'hasEnded', message: 'Domain have been leased' },
      //   });
      // }

      // const bid_count = await this.bidRepository.countBidByUserIdAuctionId(
      //   auction.id,
      //   user_id,
      // );

      // if (Number(bid_count) === 0) {
      //   throw new UnprocessableEntityException({
      //     status: HttpStatus.UNPROCESSABLE_ENTITY,
      //     errors: {
      //       auction_id: 'canNotIncreaseNoPreviousBid',
      //       message: 'Bid cannot be increased, no previous bid',
      //     },
      //   });
      // }

      // if (
      //   user_id === auction.current_winner &&
      //   Number(increaseBidDto.amount) <= Number(auction.highest_bid)
      // ) {
      //   throw new UnprocessableEntityException({
      //     status: HttpStatus.UNPROCESSABLE_ENTITY,
      //     errors: {
      //       auction_id: 'amountLessThanPreviousBid',
      //       message: 'Bid amount must be greater than your previous bid',
      //     },
      //   });
      // }

      // const minIncrement = Number(auction.min_increment) || 0;
      // const currentHighestBid = Number(auction.current_bid) || 0;

      // if (Number(increaseBidDto.amount) < currentHighestBid + minIncrement) {
      //   throw new UnprocessableEntityException({
      //     status: HttpStatus.UNPROCESSABLE_ENTITY,
      //     errors: {
      //       auction_id: 'amountLessCurrentBidPlusMinIncrement',
      //       message: `Bid amount must be greater than current bid plus minimum increament ${minIncrement}`,
      //     },
      //   });
      // }

      // Validate user and auction
      const user = await this.validateUser(user_id);
      const auction = await this.validateAuction(increaseBidDto.auction_id);

      // Validate auction state
      this.validateAuctionState(auction);

      // Validate user's existing bid
      await this.validateUserBid(auction.id, user_id);

      // Additional validation for bid amount
      this.validateBidAmount(
        increaseBidDto.amount,
        auction.current_bid,
        auction.min_increment,
        auction.highest_bid,
        auction.current_winner || '',
        user_id,
      );

      if (Number(increaseBidDto.amount) > Number(auction.highest_bid)) {
        const highestBid = Number(auction.highest_bid);
        const minIncrement = Number(auction.min_increment);
        const reservePrice = Number(auction.reserve_price);
        const currentBid = Number(auction.current_bid);
        const userBid = Number(increaseBidDto.amount);

        const maxBidAllowed = highestBid + minIncrement; // Maximum possible bid
        let validCurrentBid: number;
        if (user_id === auction.current_winner) {
          // Check reserve price condition
          if (
            Number(increaseBidDto.amount) >= reservePrice &&
            currentBid < reservePrice
          ) {
            // Update current bid to reserve price
            validCurrentBid = reservePrice;

            const newBid = manager.create(BidEntity, {
              amount: increaseBidDto.amount,
              user_id: user as UserEntity,
              domain_id: auction.domain_id as DomainEntity,
              auction_id: auction as AuctionEntity,
              created_by_method: 'USER',
              current_bid: validCurrentBid,
            });
            await manager.save(newBid);

            // **Update action**
            const auctionRepository =
              queryRunner.manager.getRepository(AuctionEntity);
            await auctionRepository.update(auction.id, {
              highest_bid: increaseBidDto.amount,
              winning_bid_id: newBid.id,
              current_bid: validCurrentBid,
            });
            // update domain table
            const domainRepository =
              queryRunner.manager.getRepository(DomainEntity);
            await domainRepository.update(auction.domain_id.id, {
              current_highest_bid: validCurrentBid,
            });

            // Create logs for the former and updated highest bids
            const formerBidLog = manager.create(BidLogsEntity, {
              amount: highestBid,
              bidder: auction.current_winner,
              bid_id: newBid,
            });

            const updatedBidLog = manager.create(BidLogsEntity, {
              amount: validCurrentBid,
              bidder: auction.current_winner,
              bid_id: newBid,
            });

            await manager.save(formerBidLog);
            await manager.save(updatedBidLog);
          } else {
            // Directly update the highest bid
            validCurrentBid = Number(auction.current_bid);

            const newBid = manager.create(BidEntity, {
              amount: increaseBidDto.amount,
              user_id: user as UserEntity,
              domain_id: auction.domain_id as DomainEntity,
              auction_id: auction as AuctionEntity,
              created_by_method: 'USER',
              current_bid: validCurrentBid,
            });
            await manager.save(newBid);
            // **Update action**
            const auctionRepository =
              queryRunner.manager.getRepository(AuctionEntity);
            await auctionRepository.update(auction.id, {
              highest_bid: increaseBidDto.amount,
              winning_bid_id: newBid.id,
            });
          }
        } else {
          if (userBid >= reservePrice && currentBid < reservePrice) {
            // Case: User's bid meets reserve price and current bid is below reserve
            validCurrentBid = Math.max(
              reservePrice,
              Math.min(maxBidAllowed, userBid),
            );
          } else {
            // General case: No special reserve price condition
            validCurrentBid = Math.min(maxBidAllowed, userBid);
          }
          // Save the new bid
          const newBid = manager.create(BidEntity, {
            amount: increaseBidDto.amount,
            user_id: user as UserEntity,
            domain_id: auction.domain_id as DomainEntity,
            auction_id: auction as AuctionEntity,
            created_by_method: 'USER',
            current_bid: validCurrentBid,
          });

          await manager.save(newBid);

          // **Update action**
          const auctionRepository =
            queryRunner.manager.getRepository(AuctionEntity);
          await auctionRepository.update(auction.id, {
            current_bid: validCurrentBid,
            highest_bid: increaseBidDto.amount,
            current_winner: user_id,
            winning_bid_id: newBid.id,
          });

          // update domain table
          const domainRepository =
            queryRunner.manager.getRepository(DomainEntity);
          await domainRepository.update(auction.domain_id.id, {
            current_highest_bid: validCurrentBid,
          });

          const newBidLogs = manager.create(BidLogsEntity, {
            amount: Number(auction.highest_bid),
            bidder: auction.current_winner,
            bid_id: newBid,
          });
          const newBidLogs2 = manager.create(BidLogsEntity, {
            amount: validCurrentBid,
            bidder: user_id,
            bid_id: newBid,
          });

          await manager.save(newBidLogs);
          await manager.save(newBidLogs2);
          // send email to prvious winner
          const previous_highest_user = await this.userService.findById(
            auction.current_winner!,
          );
          if (!previous_highest_user) {
            console.log('No previous winner');
          } else {
            void this.mailService.outBid({
              to: previous_highest_user.email!,
              data: {
                domaiName: auction.domain_id.url,
                userBidAmount: auction.highest_bid, // This is the previous highest bid amount
                auctionEndTime: auction.end_time,
                currentHighestBid: increaseBidDto.amount, // This is the new current bid amount
                firstName: previous_highest_user.first_name ?? 'User',
              },
            });
          }
        }
      } else {
        const userBid = Number(increaseBidDto.amount);
        const minIncrement = Number(auction.min_increment);
        const highestBid = Number(auction.highest_bid);
        const reservePrice = Number(auction.reserve_price);
        const currentBid = Number(auction.current_bid);

        const maxUserBid = userBid + minIncrement; // User's bid + minimum increment
        let validCurrentBid: number;

        if (userBid >= reservePrice && currentBid < reservePrice) {
          // Case: User's bid meets reserve price and current bid is below reserve
          validCurrentBid = Math.max(
            reservePrice,
            Math.min(maxUserBid, highestBid),
          );
        } else {
          // General case: User's bid is less than the current highest amount
          validCurrentBid = Math.min(maxUserBid, highestBid);
        }
        // **Update domain status if it's the first bid**
        const auctionRepository =
          queryRunner.manager.getRepository(AuctionEntity);
        await auctionRepository.update(auction.id, {
          current_bid: validCurrentBid,
        });

        const newBid = manager.create(BidEntity, {
          amount: increaseBidDto.amount,
          user_id: user as UserEntity,
          domain_id: auction.domain_id as DomainEntity,
          auction_id: auction as AuctionEntity,
          created_by_method: 'USER',
          current_bid: validCurrentBid,
        });
        // Save the new bid
        await manager.save(newBid);

        const newBidLogs = manager.create(BidLogsEntity, {
          amount: increaseBidDto.amount,
          bidder: user_id,
          bid_id: newBid,
        });

        const newBidLogs2 = manager.create(BidLogsEntity, {
          amount: validCurrentBid,
          bidder: auction.current_winner,
          bid_id: newBid,
        });

        await manager.save(newBidLogs);

        await manager.save(newBidLogs2);
        // update domain table
        const domainRepository =
          queryRunner.manager.getRepository(DomainEntity);
        await domainRepository.update(auction.domain_id.id, {
          current_highest_bid: validCurrentBid,
        });
      }

      // **Commit the transaction**
      await queryRunner.commitTransaction();

      return { message: 'Successful' };
    } catch (error) {
      // **Rollback the transaction in case of error**
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // **Release the query runner to avoid memory leaks**
      await queryRunner.release();
    }
  }

  // Helper Methods
  private async validateUser(user_id: string) {
    const user = await this.userService.findById(user_id);
    if (!user) {
      throw new UnprocessableEntityException({
        errors: { message: 'User does not exist' },
      });
    }
    return user;
  }

  private async validateAuction(auction_id: string) {
    const auction = await this.auctionService.findById(auction_id);
    if (!auction) {
      throw new UnprocessableEntityException({
        errors: { message: 'Auction does not exist' },
      });
    }
    return auction;
  }

  private validateAuctionState(auction: Auction) {
    const currentTime = new Date();
    if (auction.start_time && currentTime < auction.start_time) {
      throw new UnprocessableEntityException({
        errors: { message: 'Auction has not started' },
      });
    }
    if (
      (auction.end_time && currentTime > auction.end_time) ||
      auction.status === 'LEASE_PENDING'
    ) {
      throw new UnprocessableEntityException({
        errors: { message: 'Auction has ended' },
      });
    }
  }

  private async validateUserBid(auction_id: string, user_id: string) {
    const bidCount = await this.bidRepository.countBidByUserIdAuctionId(
      auction_id,
      user_id,
    );
    if (Number(bidCount) === 0) {
      throw new UnprocessableEntityException({
        errors: { message: 'No existing bid to increase' },
      });
    }
  }

  private validateBidAmount(
    amount: number,
    currentBid: number,
    minIncrement: number,
    highestBid: number,
    currentWinner: string,
    user_id: string,
  ) {
    const minAllowed = Number(currentBid) + Number(minIncrement);
    if (amount < minAllowed) {
      throw new UnprocessableEntityException({
        errors: {
          message: `Bid amount must be at least ${minAllowed}`,
        },
      });
    }
    if (user_id === currentWinner && Number(amount) <= Number(highestBid)) {
      throw new UnprocessableEntityException({
        errors: { message: 'Bid must exceed your previous highest bid' },
      });
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

  // private filterBidsResponse(bids: Bid[]) {
  //   return bids.map((bid) => {
  //     const { auction_id, user_id, domain_id, ...otherBidFields } = bid;
  //     const { status, ...otherAuctionFields } = auction_id; // Exclude only `status`
  //     const { current_winner, current_bid } = auction_id;
  //     const { amount } = bid;

  //     let auction_status: string;
  //     const bid_status =
  //       Number(amount) > Number(current_bid) && user_id.id === current_winner
  //         ? 'WINNING'
  //         : 'OUT BID';

  //     if(Number(amount) >= Number(current_bid) && user_id.id === current_winner){

  //     }
  //     switch (status) {
  //       case 'ACTIVE':
  //         auction_status = 'ACTIVE';
  //         break;
  //       case 'FAILED':
  //         auction_status = 'CANCELLED';
  //         break;
  //       case 'ENDED':
  //       case 'LEASE_PENDING':
  //         auction_status = 'ENDED';
  //         break;
  //       case 'PAYMENT_PROCESSING':
  //       case 'PAYMENT_PENDING':
  //       case 'PAYMENT_COMPLETED':
  //       case 'PAYMENT_FAILED':
  //         auction_status = current_winner === user_id.id ? status : 'ENDED';
  //         break;
  //       default:
  //         auction_status = 'UNKNOWN';
  //     }

  //     return {
  //       ...otherBidFields,
  //       auction_id: {
  //         ...otherAuctionFields,
  //       },
  //       auction_status,
  //       bid_status,
  //       url: domain_id.url,
  //       domain_id: domain_id.id,
  //     };
  //   });
  // }

  // private filterBidsResponse(bids: Bid[]) {
  //   return bids.map((bid) => {
  //     const { auction_id, user_id, domain_id, ...otherBidFields } = bid;
  //     const { status, reserve_price,   ...otherAuctionFields } = auction_id;
  //     const { amount } = bid;
  //     const { current_winner, current_bid } = auction_id;

  //     // Determine bid status
  //     let bid_status = 'OUT BID'; // Default
  //     if (Number(amount) > Number(current_bid) && user_id.id === current_winner) {
  //       if (Number(amount) >= Number(reserve_price)) {
  //         bid_status = 'WINNING';
  //       } else {
  //         bid_status = 'WINNIG(RESERVE NOT MET)';
  //       }
  //     }

  //     // Determine auction status
  //     let auction_status: string;
  //     switch (status) {
  //       case 'ACTIVE':
  //         auction_status = 'ACTIVE';
  //         break;
  //       case 'FAILED':
  //         auction_status = 'CANCELLED';
  //         break;
  //       case 'ENDED':
  //       case 'LEASE_PENDING':
  //         auction_status = 'ENDED';
  //         break;
  //       case 'PAYMENT_PROCESSING':
  //       case 'PAYMENT_PENDING':
  //       case 'PAYMENT_COMPLETED':
  //       case 'PAYMENT_FAILED':
  //         auction_status = current_winner === user_id.id ? status : 'ENDED';
  //         break;
  //       default:
  //         auction_status = 'UNKNOWN';
  //     }

  //     return {
  //       ...otherBidFields,
  //       auction_id: {
  //         ...otherAuctionFields,
  //       },
  //       auction_status,
  //       bid_status,
  //       url: domain_id.url,
  //       domain_id: domain_id.id,
  //     };
  //   });
  // }
  private filterBidsResponse(bids: Bid[]) {
    return bids.map((bid) => {
      const { auction_id, user_id, domain_id, ...otherBidFields } = bid;
      const { status, reserve_price, ...otherAuctionFields } = auction_id;
      const { current_winner, current_bid } = auction_id;
      const { amount } = bid;

      // Determine bid status
      let bid_status = 'OUT BID'; // Default

      if (status === 'FAILED') {
        if (Number(amount) < Number(reserve_price)) {
          bid_status = 'RESERVE NOT MET';
        } else {
          bid_status = 'CANCELLED';
        }
      } else if (status === 'CANCELLED') {
        bid_status = 'BIDDING CANCELLED'; // Custom response for cancelled auctions
      } else if (
        Number(amount) > Number(current_bid) &&
        user_id.id === current_winner
      ) {
        if (Number(amount) >= Number(reserve_price)) {
          bid_status = 'WINNING';
        } else {
          bid_status = 'WINNING(RESERVE NOT MET)';
        }
      }

      // Determine auction status
      let auction_status: string;
      switch (status) {
        case 'ACTIVE':
          auction_status = 'ACTIVE';
          break;
        case 'FAILED':
          auction_status = 'CANCELLED';
          break;
        case 'ENDED':
        case 'LEASE_PENDING':
          auction_status = 'ENDED';
          break;
        case 'PAYMENT_PROCESSING':
        case 'PAYMENT_PENDING':
        case 'PAYMENT_COMPLETED':
        case 'PAYMENT_FAILED':
          auction_status = current_winner === user_id.id ? status : 'ENDED';
          break;
        default:
          auction_status = 'UNKNOWN';
      }

      return {
        ...otherBidFields,
        auction_id: {
          ...otherAuctionFields,
        },
        auction_status,
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
          errors: {
            auction_id: 'notExists',
            message: 'Auction does not exists',
          },
        });
      }

      if (auction_id.status === 'LEASE_PENDING') {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            auction_id: 'leaseOngoing',
            message: 'Domain has been leased',
          },
        });
      }

      const currentTime = new Date();
      if (auction_id.start_time && currentTime < auction_id.start_time) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { auction: 'notStarted', message: 'Auction not started' },
        });
      }

      if (auction_id.end_time && currentTime > auction_id.end_time) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { auction: 'hasEnded', message: 'Auction has ended' },
        });
      }

      const settingsKey = 'LEASE_PRICE_THRESHOLD_PERCENTAGE';
      const settingsConfig = await this.settingsService.findByKey(settingsKey);

      const leaseThreshold = Number(settingsConfig?.value) / 100 || 80;

      const leaseValue = Number(auction_id.lease_price) * leaseThreshold;

      if (Number(auction_id.current_bid) >= leaseValue) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { domain_id: 'leaseNotAvailable', message: '' },
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
        success_url: `${url}/payment/success-page`,
        cancel_url: `${url}/payment/failed-page`,
      });

      console.log(session);

      // **Create bid**: Now that user_id, domain_id, and auction_id are resolved, create the bid entity
      const newPayment = manager.create(PaymentEntity, {
        user_id: user_id as UserEntity,
        amount: auction_id.lease_price,
        auction_id: auction_id as AuctionEntity,
        status: 'PROCESSING',
        stripe_id: session.id,
        payment_url: session.url,
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
        current_bid: auction_id.lease_price,
        current_winner: user_id.id,
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

  async findCountByAuctionId(auctioId: string) {
    return this.bidRepository.findCountByAuctionId(auctioId);
  }

  async countBidByUserIdAuctionId(auctioId: string, user_id: string) {
    return this.bidRepository.countBidByUserIdAuctionId(auctioId, user_id);
  }
}
