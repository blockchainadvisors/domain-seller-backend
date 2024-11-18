import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AuctionEntity } from '../entities/auction.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Auction } from '../../../../domain/auction';
import { AuctionRepository } from '../../auction.repository';
import { AuctionMapper } from '../mappers/auction.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class AuctionRelationalRepository implements AuctionRepository {
  constructor(
    @InjectRepository(AuctionEntity)
    private readonly auctionRepository: Repository<AuctionEntity>,
  ) {}

  async create(data: Auction): Promise<Auction> {
    const persistenceModel = AuctionMapper.toPersistence(data);
    const newEntity = await this.auctionRepository.save(
      this.auctionRepository.create(persistenceModel),
    );
    return AuctionMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Auction[]> {
    const entities = await this.auctionRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => AuctionMapper.toDomain(entity));
  }

  async findById(id: Auction['id']): Promise<NullableType<Auction>> {
    const entity = await this.auctionRepository.findOne({
      where: { id },
    });

    return entity ? AuctionMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Auction['id'][]): Promise<Auction[]> {
    const entities = await this.auctionRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => AuctionMapper.toDomain(entity));
  }

  async update(id: Auction['id'], payload: Partial<Auction>): Promise<Auction> {
    const entity = await this.auctionRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.auctionRepository.save(
      this.auctionRepository.create(
        AuctionMapper.toPersistence({
          ...AuctionMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return AuctionMapper.toDomain(updatedEntity);
  }

  async remove(id: Auction['id']): Promise<void> {
    await this.auctionRepository.delete(id);
  }

  // Fetch auctions with statuses that need processing (DRAFT and ACTIVE)
  async getAuctionsForProcessing(): Promise<Auction[]> {
    const entities = await this.auctionRepository.find({
      where: [{ status: 'DRAFT' }, { status: 'ACTIVE' }],
    });

    return entities.map((entity) => AuctionMapper.toDomain(entity));
  }
}
