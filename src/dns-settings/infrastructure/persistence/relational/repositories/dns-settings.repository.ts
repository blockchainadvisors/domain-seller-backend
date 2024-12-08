import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DnsSettingsEntity } from '../entities/dns-settings.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { DnsSettings } from '../../../../domain/dns-settings';
import { DnsSettingsRepository } from '../../dns-settings.repository';
import { DnsSettingsMapper } from '../mappers/dns-settings.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class DnsSettingsRelationalRepository implements DnsSettingsRepository {
  constructor(
    @InjectRepository(DnsSettingsEntity)
    private readonly dnsSettingsRepository: Repository<DnsSettingsEntity>,
  ) {}

  async create(data: DnsSettings): Promise<DnsSettings> {
    const persistenceModel = DnsSettingsMapper.toPersistence(data);
    const newEntity = await this.dnsSettingsRepository.save(
      this.dnsSettingsRepository.create(persistenceModel),
    );
    return DnsSettingsMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<DnsSettings[]> {
    const entities = await this.dnsSettingsRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => DnsSettingsMapper.toDomain(entity));
  }

  async findById(id: DnsSettings['id']): Promise<NullableType<DnsSettings>> {
    const entity = await this.dnsSettingsRepository.findOne({
      where: { id },
    });

    return entity ? DnsSettingsMapper.toDomain(entity) : null;
  }

  async findByBidId(bidId: string): Promise<NullableType<DnsSettings>> {
    const entity = await this.dnsSettingsRepository.findOne({
      where: { bid_id: { id: bidId } },
    });

    return entity ? DnsSettingsMapper.toDomain(entity) : null;
  }

  async findByIds(ids: DnsSettings['id'][]): Promise<DnsSettings[]> {
    const entities = await this.dnsSettingsRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => DnsSettingsMapper.toDomain(entity));
  }

  async update(
    id: DnsSettings['id'],
    payload: Partial<DnsSettings>,
  ): Promise<DnsSettings> {
    const entity = await this.dnsSettingsRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.dnsSettingsRepository.save(
      this.dnsSettingsRepository.create(
        DnsSettingsMapper.toPersistence({
          ...DnsSettingsMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return DnsSettingsMapper.toDomain(updatedEntity);
  }

  async remove(id: DnsSettings['id']): Promise<void> {
    await this.dnsSettingsRepository.delete(id);
  }
}
