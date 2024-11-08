import { DomainsService } from '../domains/domains.service';
import { Domain } from '../domains/domain/domain';

import {
  BadRequestException,
  HttpStatus,
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
    await this.domainService.update(domain.id, domain);

    // Create the auction
    return this.auctionRepository.create({
      min_increment: createAuctionDto.min_increment,
      reserve_price: createAuctionDto.reserve_price,
      end_time: createAuctionDto.end_time,
      start_time: createAuctionDto.start_time,
      domain_id: domain,
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

  async update(
    id: Auction['id'],

    updateAuctionDto: UpdateAuctionDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

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

    return this.auctionRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      min_increment: updateAuctionDto.min_increment,

      reserve_price: updateAuctionDto.reserve_price,

      end_time: updateAuctionDto.end_time,

      start_time: updateAuctionDto.start_time,

      domain_id,
    });
  }

  remove(id: Auction['id']) {
    return this.auctionRepository.remove(id);
  }
}
