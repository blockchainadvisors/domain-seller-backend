import { AuctionEntity } from '../../../../../auctions/infrastructure/persistence/relational/entities/auction.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { Offers } from '../../../../domain/offers';

import { OffersEntity } from '../entities/offers.entity';

export class OffersMapper {
  static toDomain(raw: OffersEntity): Offers {
    const domainEntity = new Offers();
    domainEntity.status = raw.status;

    domainEntity.offer_amount = raw.offer_amount;

    domainEntity.id = raw.id;
    domainEntity.created_at = raw.created_at;
    domainEntity.updated_at = raw.updated_at;

    // **Map the user** and exclude password
    if (raw.user_id) {
      const user = raw.user_id;
      domainEntity.user_id = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name, // Only include non-sensitive fields
      };
    }

    // **Map the auction**
    if (raw.auction_id) {
      const auction = raw.auction_id;
      domainEntity.auction_id = {
        id: auction.id,
        start_time: auction.start_time,
        end_time: auction.end_time,
        status: auction.status,
        current_winner: auction.current_winner,
        domain_id: {
          id: auction.domain_id.id,
          status: auction.domain_id.status,
          url: auction.domain_id.url,
          created_at: auction.domain_id.created_at,
          updated_at: auction.domain_id.updated_at,
        },
      };
    }

    return domainEntity;
  }

  static toPersistence(domainEntity: Offers): OffersEntity {
    const persistenceEntity = new OffersEntity();
    persistenceEntity.status = domainEntity.status;

    persistenceEntity.offer_amount = domainEntity.offer_amount;

    if (domainEntity.user_id) {
      persistenceEntity.user_id = domainEntity.user_id as UserEntity;
    }

    if (domainEntity.auction_id) {
      persistenceEntity.auction_id = domainEntity.auction_id as AuctionEntity;
    }

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.created_at = domainEntity.created_at;
    persistenceEntity.updated_at = domainEntity.updated_at;

    return persistenceEntity;
  }
}
