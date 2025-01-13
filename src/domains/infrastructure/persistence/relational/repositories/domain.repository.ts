import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DomainEntity } from '../entities/domain.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Domain } from '../../../../domain/domain';
import { DomainRepository } from '../../domain.repository';
import { DomainMapper } from '../mappers/domain.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class DomainRelationalRepository implements DomainRepository {
  constructor(
    @InjectRepository(DomainEntity)
    private readonly domainRepository: Repository<DomainEntity>,
  ) {}

  async create(data: Domain): Promise<Domain> {
    const persistenceModel = DomainMapper.toPersistence(data);
    const newEntity = await this.domainRepository.save(
      this.domainRepository.create(persistenceModel),
    );
    return DomainMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Domain[]> {
    const entities = await this.domainRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => DomainMapper.toDomain(entity));
  }

  async findById(id: Domain['id']): Promise<NullableType<Domain>> {
    const entity = await this.domainRepository.findOne({
      where: { id },
    });

    return entity ? DomainMapper.toDomain(entity) : null;
  }

  async findByName(url: string): Promise<NullableType<Domain>> {
    const entity = await this.domainRepository.findOne({
      where: { url },
    });

    return entity ? DomainMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Domain['id'][]): Promise<Domain[]> {
    const entities = await this.domainRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => DomainMapper.toDomain(entity));
  }

  async update(id: Domain['id'], payload: Partial<Domain>): Promise<Domain> {
    const entity = await this.domainRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.domainRepository.save(
      this.domainRepository.create(
        DomainMapper.toPersistence({
          ...DomainMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return DomainMapper.toDomain(updatedEntity);
  }

  async remove(id: Domain['id']): Promise<void> {
    await this.domainRepository.delete(id);
  }

  async findAuctionActiveWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Domain[]> {
    const entities = await this.domainRepository.find({
      where: [{ status: 'AUCTION_ACTIVE' }, { status: 'BID_RECEIVED' }],
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => DomainMapper.toDomain(entity));
  }

  async findMyDomainsWithPagination(
    { paginationOptions }: { paginationOptions: IPaginationOptions },
    user_id: string,
  ): Promise<any[]> {
    const entities = await this.domainRepository.find({
      where: { current_owner: user_id },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      relations: ['auction'], // Ensure the auction relationship is fetched
    });

    return entities.map((entity) => ({
      id: entity.id,
      current_highest_bid: entity.current_highest_bid,
      category: entity.category,
      description: entity.description,
      status: entity.status,
      url: entity.url,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      registration_date: entity.registration_date,
      renewal_price: entity.renewal_price,
      expiry_duration: entity.auction?.expiry_duration || null, // Access expiry_duration from auction
    }));
  }
}
