import { Bid } from '../../../../domain/bid';
import { BidEntity } from '../entities/bid.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { DomainEntity } from '../../../../../domains/infrastructure/persistence/relational/entities/domain.entity';
import { AuctionEntity } from '../../../../../auctions/infrastructure/persistence/relational/entities/auction.entity';

export class BidMapper {
  static toDomain(raw: BidEntity): Bid {
    const domainEntity = new Bid();

    domainEntity.amount = raw.amount;

    domainEntity.current_bid = raw.current_bid;
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

    // **Map the domain**
    if (raw.domain_id) {
      const domain = raw.domain_id;
      domainEntity.domain_id = {
        id: domain.id,
        status: domain.status,
        current_highest_bid: domain.current_highest_bid,
        url: domain.url,
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
        highest_bid: auction.highest_bid,
        current_bid: auction.current_bid,
        reserve_price: auction.reserve_price,
      };
    }

    return domainEntity;
  }

  static toPersistence(domainEntity: Bid): BidEntity {
    const persistenceEntity = new BidEntity();
    persistenceEntity.amount = domainEntity.amount;
    persistenceEntity.current_bid = domainEntity.current_bid;

    let user: UserEntity | undefined = undefined;
    if (domainEntity.user_id) {
      user = new UserEntity();
      user.id = domainEntity.user_id.id;
    }

    let domain: DomainEntity | undefined = undefined;
    if (domainEntity.domain_id) {
      domain = new DomainEntity();
      domain.id = domainEntity.domain_id.id;
    }

    let auction: AuctionEntity | undefined = undefined;
    if (domainEntity.auction_id) {
      auction = new AuctionEntity();
      auction.id = domainEntity.auction_id.id;
    }

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.created_at = domainEntity.created_at;
    persistenceEntity.updated_at = domainEntity.updated_at;

    return persistenceEntity;
  }
}
