import { Auction } from '../../../../domain/auction';

import { DomainMapper } from '../../../../../domains/infrastructure/persistence/relational/mappers/domain.mapper';

import { AuctionEntity } from '../entities/auction.entity';

export class AuctionMapper {
  static toDomain(raw: AuctionEntity): Auction {
    const domainEntity = new Auction();
    domainEntity.min_increment = raw.min_increment;

    domainEntity.reserve_price = raw.reserve_price;

    domainEntity.end_time = raw.end_time;

    domainEntity.start_time = raw.start_time;

    if (raw.domain_id) {
      domainEntity.domain_id = DomainMapper.toDomain(raw.domain_id);
    }

    domainEntity.id = raw.id;
    domainEntity.created_at = raw.created_at;
    domainEntity.updated_at = raw.updated_at;

    return domainEntity;
  }

  static toPersistence(domainEntity: Auction): AuctionEntity {
    const persistenceEntity = new AuctionEntity();
    persistenceEntity.min_increment = domainEntity.min_increment;

    persistenceEntity.reserve_price = domainEntity.reserve_price;

    persistenceEntity.end_time = domainEntity.end_time;

    persistenceEntity.start_time = domainEntity.start_time;

    if (domainEntity.domain_id) {
      persistenceEntity.domain_id = DomainMapper.toPersistence(
        domainEntity.domain_id,
      );
    }

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.created_at = domainEntity.created_at;
    persistenceEntity.updated_at = domainEntity.updated_at;

    return persistenceEntity;
  }
}
