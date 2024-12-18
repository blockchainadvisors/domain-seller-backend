import { Injectable } from '@nestjs/common';
import { CreateBidLogsDto } from './dto/create-bid-logs.dto';
import { UpdateBidLogsDto } from './dto/update-bid-logs.dto';
import { BidLogsRepository } from './infrastructure/persistence/bid-logs.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { BidLogs } from './domain/bid-logs';

@Injectable()
export class BidLogsService {
  constructor(
    // Dependencies here
    private readonly bidLogsRepository: BidLogsRepository,
  ) {}

  async create(createBidLogsDto: CreateBidLogsDto) {
    // Do not remove comment below.
    // <creating-property />

    return this.bidLogsRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      bidder: createBidLogsDto.bidder,

      bid_id: createBidLogsDto.bid_id,

      amount: createBidLogsDto.amount,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.bidLogsRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: BidLogs['id']) {
    return this.bidLogsRepository.findById(id);
  }

  findByIds(ids: BidLogs['id'][]) {
    return this.bidLogsRepository.findByIds(ids);
  }

  async update(
    id: BidLogs['id'],

    updateBidLogsDto: UpdateBidLogsDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.bidLogsRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      bidder: updateBidLogsDto.bidder,

      amount: updateBidLogsDto.amount,
    });
  }

  remove(id: BidLogs['id']) {
    return this.bidLogsRepository.remove(id);
  }
}
