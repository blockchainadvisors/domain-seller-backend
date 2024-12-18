import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
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

  // async findMyBidWithPagination(
  //   {
  //     paginationOptions,
  //   }: {
  //     paginationOptions: IPaginationOptions;
  //   },
  //   user_id: string,
  // ): Promise<Bid[]> {
  //   const entities = await this.bidRepository.find({
  //     where: { user_id: { id: user_id } },
  //     skip: (paginationOptions.page - 1) * paginationOptions.limit,
  //     take: paginationOptions.limit,
  //   });

  //   console.log(entities)

  //   return entities.map((entity) => BidMapper.toDomain(entity));
  // }

  async findMyBidWithPagination(
    {
      paginationOptions,
    }: {
      paginationOptions: IPaginationOptions;
    },
    user_id: string,
  ): Promise<Bid[]> {
    const { page, limit } = paginationOptions;
    const skip = (page - 1) * limit;

    // Subquery to find the latest bid per auction for the user
    const subquery = this.bidRepository
      .createQueryBuilder('sub_bid')
      .select('MAX(sub_bid.created_at)', 'latest_bid_time')
      .addSelect('sub_bid.auction_id', 'auction_id')
      .where('sub_bid.user_id = :user_id', { user_id })
      .groupBy('sub_bid.auction_id');

    // Main query to fetch bids
    const bids = await this.bidRepository
      .createQueryBuilder('bid')
      .leftJoinAndSelect('bid.user_id', 'user') // Include UserEntity fields
      .leftJoinAndSelect('bid.domain_id', 'domain') // Include DomainEntity fields
      .leftJoinAndSelect('bid.auction_id', 'auction') // Include AuctionEntity fields
      .innerJoin(
        '(' + subquery.getQuery() + ')',
        'latest_bids',
        'bid.auction_id = latest_bids.auction_id AND bid.created_at = latest_bids.latest_bid_time',
      )
      .setParameters(subquery.getParameters())
      .where('bid.user_id = :user_id', { user_id })
      .skip(skip)
      .take(limit)
      .getMany();

    return bids.map((entity) => BidMapper.toDomain(entity));
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

  async findNextHighestBidder(
    auctionId: Auction['id'],
    currentHighestAmount: number,
  ): Promise<NullableType<Bid>> {
    const entity = await this.bidRepository.findOne({
      where: {
        auction_id: { id: auctionId },
        amount: LessThan(currentHighestAmount), // Exclude bids >= current highest amount
      },
      order: { amount: 'DESC' }, // Get the next highest bid
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

  async findCountByAuctionId(auction_id: string): Promise<number> {
    return this.bidRepository.count({
      where: { auction_id: { id: auction_id } },
    });
  }

  async countBidByUserIdAuctionId(
    auction_id: string,
    user_id: string,
  ): Promise<number> {
    return this.bidRepository.count({
      where: { auction_id: { id: auction_id }, user_id: { id: user_id } },
    });
  }
}
