import { DomainsService } from '../domains/domains.service';
import { Domain } from '../domains/domain/domain';

import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { Injectable } from '@nestjs/common';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { AuctionRepository } from './infrastructure/persistence/auction.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Auction } from './domain/auction';

@Injectable()
export class AuctionsService {
  constructor(
    private readonly domainService: DomainsService,

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

    // Update the domain status to 'AUCTION_PENDING'
    domain.status = 'AUCTION_PENDING';
    domain.current_highest_bid = 0;
    await this.domainService.update(domain.id, domain);
    const status = 'DRAFT';
    // Create the auction
    return this.auctionRepository.create({
      min_increment: createAuctionDto.min_increment,
      min_price: createAuctionDto.min_price,
      reserve_price: createAuctionDto.reserve_price,
      end_time: createAuctionDto.end_time,
      start_time: createAuctionDto.start_time,
      domain_id: domain,
      status,
      lease_price: createAuctionDto.lease_price,
    });
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
    // Fetch the existing auction
    const auction = await this.auctionRepository.findById(id);

    if (!auction) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: 'Auction not found',
      });
    }

    const currentDate = new Date();

    // Check if the auction has ended
    if (currentDate >= auction.end_time) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        error: 'Cannot modify an auction that has already ended',
      });
    }

    // If the auction has started, restrict some fields
    if (currentDate >= auction.start_time) {
      // Cannot modify start_time and reserve_price after auction starts
      if (
        updateAuctionDto.start_time &&
        updateAuctionDto.start_time !== auction.start_time
      ) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          error: 'Cannot modify start_time after the auction has started',
        });
      }

      if (
        updateAuctionDto.reserve_price &&
        updateAuctionDto.reserve_price !== auction.reserve_price
      ) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          error: 'Cannot modify reserve_price after the auction has started',
        });
      }
    }

    // Handle domain_id update if provided
    let domain_id: Domain | undefined = undefined;
    if (updateAuctionDto.domain_id) {
      const domain_idObject = await this.domainService.findById(
        updateAuctionDto.domain_id,
      );
      if (!domain_idObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            domain_id: 'notExists',
          },
        });
      }
      domain_id = domain_idObject;
    }

    // Proceed with updating the auction
    return this.auctionRepository.update(id, {
      min_increment:
        updateAuctionDto.min_increment || Number(auction.min_increment),
      reserve_price:
        updateAuctionDto.reserve_price || Number(auction.reserve_price),
      end_time: updateAuctionDto.end_time || auction.end_time,
      start_time: updateAuctionDto.start_time || auction.start_time,
      domain_id: domain_id || auction.domain_id,
      min_price: updateAuctionDto.min_price || Number(auction.min_price),
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
}
