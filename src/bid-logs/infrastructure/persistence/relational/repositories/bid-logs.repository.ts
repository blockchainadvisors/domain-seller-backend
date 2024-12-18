import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BidLogsEntity } from '../entities/bid-logs.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { BidLogs } from '../../../../domain/bid-logs';
import { BidLogsRepository } from '../../bid-logs.repository';
import { BidLogsMapper } from '../mappers/bid-logs.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class BidLogsRelationalRepository implements BidLogsRepository {
  constructor(
    @InjectRepository(BidLogsEntity)
    private readonly bidLogsRepository: Repository<BidLogsEntity>,
  ) {}

  async create(data: BidLogs): Promise<BidLogs> {
    const persistenceModel = BidLogsMapper.toPersistence(data);
    const newEntity = await this.bidLogsRepository.save(
      this.bidLogsRepository.create(persistenceModel),
    );
    return BidLogsMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<BidLogs[]> {
    const entities = await this.bidLogsRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => BidLogsMapper.toDomain(entity));
  }

  async findById(id: BidLogs['id']): Promise<NullableType<BidLogs>> {
    const entity = await this.bidLogsRepository.findOne({
      where: { id },
    });

    return entity ? BidLogsMapper.toDomain(entity) : null;
  }

  async findByIds(ids: BidLogs['id'][]): Promise<BidLogs[]> {
    const entities = await this.bidLogsRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => BidLogsMapper.toDomain(entity));
  }

  async update(id: BidLogs['id'], payload: Partial<BidLogs>): Promise<BidLogs> {
    const entity = await this.bidLogsRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.bidLogsRepository.save(
      this.bidLogsRepository.create(
        BidLogsMapper.toPersistence({
          ...BidLogsMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return BidLogsMapper.toDomain(updatedEntity);
  }

  async remove(id: BidLogs['id']): Promise<void> {
    await this.bidLogsRepository.delete(id);
  }
}
