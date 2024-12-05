import { Domain } from '../../../../domain/domain';

import { DomainEntity } from '../entities/domain.entity';

export class DomainMapper {
  static toDomain(raw: DomainEntity): Domain {
    const domainEntity = new Domain();

    domainEntity.id = raw.id;

    domainEntity.current_highest_bid = raw.current_highest_bid;

    domainEntity.status = raw.status;

    if (raw.category) {
      domainEntity.category = raw.category;
    }

    domainEntity.description = raw.description;

    domainEntity.url = raw.url;

    domainEntity.created_at = raw.created_at;
    domainEntity.updated_at = raw.updated_at;

    return domainEntity;
  }

  static toPersistence(domainEntity: Domain): DomainEntity {
    const persistenceEntity = new DomainEntity();

    persistenceEntity.current_highest_bid = domainEntity.current_highest_bid;

    persistenceEntity.status = domainEntity.status;

    persistenceEntity.description = domainEntity.description;

    persistenceEntity.url = domainEntity.url;

    if (domainEntity.category) {
      persistenceEntity.category = domainEntity.category;
    }

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.created_at = domainEntity.created_at;
    persistenceEntity.updated_at = domainEntity.updated_at;

    return persistenceEntity;
  }
}
