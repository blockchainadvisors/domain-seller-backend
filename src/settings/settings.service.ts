import { Injectable } from '@nestjs/common';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsRepository } from './infrastructure/persistence/settings.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Settings } from './domain/settings';

@Injectable()
export class SettingsService {
  constructor(
    // Dependencies here
    private readonly settingsRepository: SettingsRepository,
  ) {}

  async create(createSettingsDto: CreateSettingsDto) {
    // Do not remove comment below.
    // <creating-property />

    return this.settingsRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      description: createSettingsDto.description,

      value: createSettingsDto.value,

      key: createSettingsDto.key,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.settingsRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Settings['id']) {
    return this.settingsRepository.findById(id);
  }

  findByKey(key: string) {
    return this.settingsRepository.findByKey(key);
  }

  findByIds(ids: Settings['id'][]) {
    return this.settingsRepository.findByIds(ids);
  }

  async update(
    id: Settings['id'],

    updateSettingsDto: UpdateSettingsDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.settingsRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      description: updateSettingsDto.description,

      value: updateSettingsDto.value,

      key: updateSettingsDto.key,
    });
  }

  remove(id: Settings['id']) {
    return this.settingsRepository.remove(id);
  }
}
