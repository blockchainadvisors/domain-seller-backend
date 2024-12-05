import { Settings } from '../../../../domain/settings';

import { SettingsEntity } from '../entities/settings.entity';

export class SettingsMapper {
  static toDomain(raw: SettingsEntity): Settings {
    const domainEntity = new Settings();
    domainEntity.description = raw.description;

    domainEntity.value = raw.value;

    domainEntity.key = raw.key;

    domainEntity.id = raw.id;
    domainEntity.created_at = raw.created_at;
    domainEntity.updated_at = raw.updated_at;

    return domainEntity;
  }

  static toPersistence(domainEntity: Settings): SettingsEntity {
    const persistenceEntity = new SettingsEntity();
    persistenceEntity.description = domainEntity.description;

    persistenceEntity.value = domainEntity.value;

    persistenceEntity.key = domainEntity.key;

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.created_at = domainEntity.created_at;
    persistenceEntity.updated_at = domainEntity.updated_at;

    return persistenceEntity;
  }
}
