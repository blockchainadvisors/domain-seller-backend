import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BidEntity } from '../entities/bid.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Bid } from '../../../../domain/bid';
import { BidRepository } from '../../bid.repository';
import { BidMapper } from '../mappers/bid.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { Auction } from '../../../../../auctions/domain/auction';

@Injectable()
export class BidRelationalRepository implements BidRepository {
  constructor(
    @InjectRepository(BidEntity)
    private readonly bidRepository: Repository<BidEntity>,
  ) {}

  async create(data: Bid): Promise<Bid> {
    const persistenceModel = BidMapper.toPersistence(data);
    const newEntity = await this.bidRepository.save(
      this.bidRepository.create(persistenceModel),
    );
    return BidMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Bid[]> {
    const entities = await this.bidRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => BidMapper.toDomain(entity));
  }

  async findById(id: Bid['id']): Promise<NullableType<Bid>> {
    const entity = await this.bidRepository.findOne({
      where: { id },
    });

    return entity ? BidMapper.toDomain(entity) : null;
  }

  async findHighestBidder(id: Auction['id']): Promise<NullableType<Bid>> {
    const entity = await this.bidRepository.findOne({
      where: {
        auction_id: { id }, // Access the `id` field of `auction_id` relation
      },
      order: { amount: 'DESC' },
    });

    return entity ? BidMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Bid['id'][]): Promise<Bid[]> {
    const entities = await this.bidRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => BidMapper.toDomain(entity));
  }

  async update(id: Bid['id'], payload: Partial<Bid>): Promise<Bid> {
    const entity = await this.bidRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.bidRepository.save(
      this.bidRepository.create(
        BidMapper.toPersistence({
          ...BidMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return BidMapper.toDomain(updatedEntity);
  }

  async remove(id: Bid['id']): Promise<void> {
    await this.bidRepository.delete(id);
  }
}
