import { Auction } from '../../../../domain/auction';

import { DomainMapper } from '../../../../../domains/infrastructure/persistence/relational/mappers/domain.mapper';

import { AuctionEntity } from '../entities/auction.entity';

export class AuctionMapper {
  static toDomain(raw: AuctionEntity): Auction {
    const domainEntity = new Auction();
    domainEntity.min_increment = raw.min_increment;

    domainEntity.reserve_price = raw.reserve_price;

    domainEntity.lease_price = raw.lease_price;

    domainEntity.current_bid = raw.current_bid;

    domainEntity.highest_bid = raw.highest_bid;

    domainEntity.min_price = raw.min_price;

    domainEntity.status = raw.status;

    domainEntity.end_time = raw.end_time;

    domainEntity.start_time = raw.start_time;

    if (raw.domain_id) {
      domainEntity.domain_id = DomainMapper.toDomain(raw.domain_id);
    }

    if (raw.current_winner) {
      domainEntity.current_winner = raw.current_winner;
    }

    if (raw.winning_bid_id) {
      domainEntity.winning_bid_id = raw.winning_bid_id;
    }

    
    if (raw.expiry_duration) {
      domainEntity.expiry_duration = raw.expiry_duration;
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

    persistenceEntity.lease_price = domainEntity.lease_price;

    persistenceEntity.current_bid = domainEntity.current_bid;

    persistenceEntity.highest_bid = domainEntity.highest_bid;

    persistenceEntity.expiry_duration = domainEntity.expiry_duration;

    persistenceEntity.min_price = domainEntity.min_price;

    persistenceEntity.end_time = domainEntity.end_time;

    persistenceEntity.status = domainEntity.status;

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
