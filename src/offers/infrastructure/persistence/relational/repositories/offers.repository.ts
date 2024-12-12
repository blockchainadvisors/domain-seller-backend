import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OffersEntity } from '../entities/offers.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Offers } from '../../../../domain/offers';
import { OffersRepository } from '../../offers.repository';
import { OffersMapper } from '../mappers/offers.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class OffersRelationalRepository implements OffersRepository {
  constructor(
    @InjectRepository(OffersEntity)
    private readonly offersRepository: Repository<OffersEntity>,
  ) {}

  async create(data: Offers): Promise<Offers> {
    const persistenceModel = OffersMapper.toPersistence(data);
    const newEntity = await this.offersRepository.save(
      this.offersRepository.create(persistenceModel),
    );
    return OffersMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Offers[]> {
    const entities = await this.offersRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => OffersMapper.toDomain(entity));
  }

  async findById(id: Offers['id']): Promise<NullableType<Offers>> {
    const entity = await this.offersRepository.findOne({
      where: { id },
    });

    return entity ? OffersMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Offers['id'][]): Promise<Offers[]> {
    const entities = await this.offersRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => OffersMapper.toDomain(entity));
  }

  async update(id: Offers['id'], payload: Partial<Offers>): Promise<Offers> {
    const entity = await this.offersRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.offersRepository.save(
      this.offersRepository.create(
        OffersMapper.toPersistence({
          ...OffersMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return OffersMapper.toDomain(updatedEntity);
  }

  async remove(id: Offers['id']): Promise<void> {
    await this.offersRepository.delete(id);
  }
}
