import { UsersService } from '../users/users.service';

import { DomainsService } from '../domains/domains.service';

import { AuctionsService } from '../auctions/auctions.service';

import { HttpStatus, UnprocessableEntityException } from '@nestjs/common';

import { Injectable } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { BidRepository } from './infrastructure/persistence/bid.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Bid } from './domain/bid';

@Injectable()
export class BidsService {
  constructor(
    private readonly userService: UsersService,

    private readonly domainService: DomainsService,

    private readonly auctionService: AuctionsService,

    // Dependencies here
    private readonly bidRepository: BidRepository,
  ) {}

  async create(createBidDto: CreateBidDto) {
    // Do not remove comment below.
    // <creating-property />

    const user_idObject = await this.userService.findById(
      createBidDto.user_id.id,
    );
    if (!user_idObject) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user_id: 'notExists',
        },
      });
    }
    const user_id = user_idObject;

    const domain_idObject = await this.domainService.findById(
      createBidDto.domain_id.id,
    );
    if (!domain_idObject) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          domain_id: 'notExists',
        },
      });
    }
    const domain_id = domain_idObject;

    const auction_idObject = await this.auctionService.findById(
      createBidDto.auction_id.id,
    );
    if (!auction_idObject) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user_id: 'notExists',
        },
      });
    }
    const auction_id = auction_idObject;

    return this.bidRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />

      amount: createBidDto.amount,

      user_id,

      domain_id,

      auction_id,
    });
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
