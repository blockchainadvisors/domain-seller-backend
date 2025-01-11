import { DomainsService } from '../domains/domains.service';

import {
  BadRequestException,
  forwardRef,
  HttpStatus,
  Inject,
  UnprocessableEntityException,
} from '@nestjs/common';

import { Injectable } from '@nestjs/common';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { AuctionRepository } from './infrastructure/persistence/auction.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Auction } from './domain/auction';
import { BidsService } from '../bids/bids.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class AuctionsService {
  constructor(
    private readonly domainService: DomainsService,
    @Inject(forwardRef(() => BidsService))
    private readonly bidsService: BidsService,
    private readonly settingsService: SettingsService,

    // Dependencies here
    private readonly auctionRepository: AuctionRepository,
  ) {}

  async create(createAuctionDto: CreateAuctionDto) {
    // Validate that start_time and end_time are in the future
    const currentDate = new Date();
    if (createAuctionDto.start_time <= currentDate) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        error: 'start_time must be in the future',
      });
    }

    if (createAuctionDto.end_time <= currentDate) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        error: 'end_time must be in the future',
      });
    }

    if (createAuctionDto.end_time <= createAuctionDto.start_time) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        error: 'end_time must be after start_time',
      });
    }

    // Validate domain existence
    const domain = await this.domainService.findById(
      createAuctionDto.domain_id,
    );
    if (!domain) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          domain_id: 'notExists',
        },
      });
    }

    if (domain.status != 'LISTED') {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          domain_id: 'domainNotValidtobeAuctioned',
        },
      });
    }

    const status = 'DRAFT';
    // Create the auction
    const createAuction = this.auctionRepository.create({
      min_increment: createAuctionDto.min_increment,
      min_price: createAuctionDto.min_price,
      reserve_price: createAuctionDto.reserve_price,
      end_time: createAuctionDto.end_time,
      start_time: createAuctionDto.start_time,
      domain_id: domain,
      status,
      lease_price: createAuctionDto.lease_price,
      expiry_duration: createAuctionDto.expiry_duration,
      current_bid: createAuctionDto.min_price,
      highest_bid: createAuctionDto.min_price,
    });

    await this.domainService.update(domain.id, {
      status: 'AUCTION_PENDING',
      current_highest_bid: 0,
    });

    return createAuction;
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.auctionRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Auction['id']) {
    return this.auctionRepository.findById(id);
  }

  findByIds(ids: Auction['id'][]) {
    return this.auctionRepository.findByIds(ids);
  }

  async update(id: Auction['id'], updateAuctionDto: UpdateAuctionDto) {
    // // Fetch the existing auction
    // const auction = await this.auctionRepository.findById(id);

    // if (!auction) {
    //   throw new NotFoundException({
    //     status: HttpStatus.NOT_FOUND,
    //     error: 'Auction not found',
    //   });
    // }

    // const currentDate = new Date();

    // // Check if the auction has ended
    // if (currentDate >= auction.end_time) {
    //   throw new BadRequestException({
    //     status: HttpStatus.BAD_REQUEST,
    //     error: 'Cannot modify an auction that has already ended',
    //   });
    // }

    // // If the auction has started, restrict some fields
    // if (currentDate >= auction.start_time) {
    //   // Cannot modify start_time and reserve_price after auction starts
    //   if (
    //     updateAuctionDto.start_time &&
    //     updateAuctionDto.start_time !== auction.start_time
    //   ) {
    //     throw new BadRequestException({
    //       status: HttpStatus.BAD_REQUEST,
    //       error: 'Cannot modify start_time after the auction has started',
    //     });
    //   }

    //   if (
    //     updateAuctionDto.reserve_price &&
    //     updateAuctionDto.reserve_price !== auction.reserve_price
    //   ) {
    //     throw new BadRequestException({
    //       status: HttpStatus.BAD_REQUEST,
    //       error: 'Cannot modify reserve_price after the auction has started',
    //     });
    //   }
    // }

    // // Handle domain_id update if provided
    // let domain_id: Domain | undefined = undefined;
    // if (updateAuctionDto.domain_id) {
    //   const domain_idObject = await this.domainService.findById(
    //     updateAuctionDto.domain_id,
    //   );
    //   if (!domain_idObject) {
    //     throw new UnprocessableEntityException({
    //       status: HttpStatus.UNPROCESSABLE_ENTITY,
    //       errors: {
    //         domain_id: 'notExists',
    //       },
    //     });
    //   }
    //   domain_id = domain_idObject;
    // }

    // Proceed with updating the auction
    return this.auctionRepository.update(id, {
      min_increment: updateAuctionDto.min_increment,
      reserve_price: updateAuctionDto.reserve_price,
      end_time: updateAuctionDto.end_time,
      start_time: updateAuctionDto.start_time,
      // domain_id: domain_id || auction.domain_id,
      min_price: updateAuctionDto.min_price,
    });
  }

  remove(id: Auction['id']) {
    return this.auctionRepository.remove(id);
  }

  async getAuctionsForProcessing() {
    return this.auctionRepository.getAuctionsForProcessing();
  }

  async updateStatus(auctionId: string, status: string) {
    await this.auctionRepository.update(auctionId, { status });
  }

  findActiveDomains({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.auctionRepository.findActiveDomainsWithDetails({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findAvailableDomainDetailsByAuctionId(id: Auction['id']) {
    return this.auctionRepository.findAvailableDomainDetailsByAuctionId(id);
  }

  async validateUserCanMakeRequestOnAuction(
    id: Auction['id'],
    user_id: string,
  ) {
    const bid_count = await this.bidsService.findCountByAuctionId(id);
    const is_user_place_bid = await this.bidsService.countBidByUserIdAuctionId(
      id,
      user_id,
    );
    const settingsKey = 'LEASE_PRICE_THRESHOLD_PERCENTAGE';
    const settingsConfig = await this.settingsService.findByKey(settingsKey);

    const leaseThreshold = Number(settingsConfig?.value) / 100 || 80;

    const auction = await this.auctionRepository.findById(id);
    if (!auction) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          id: 'notExists',
        },
      });
    }
    let canLease = false;
    let canBid = false;
    let canMakeOffer = false;
    const leaseValue = Number(auction.lease_price) * leaseThreshold;
    if (Number(auction.current_bid) < leaseValue) {
      canLease = true;
    }
    if (Number(bid_count) === 0) {
      canMakeOffer = true;
    }
    if (Number(is_user_place_bid) === 0) {
      canBid = true;
    }
    return { canBid, canLease, canMakeOffer };
  }
}
