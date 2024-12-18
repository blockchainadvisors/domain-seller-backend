import { BidEntity } from '../../../../../bids/infrastructure/persistence/relational/entities/bid.entity';
import { BidLogs } from '../../../../domain/bid-logs';

import { BidLogsEntity } from '../entities/bid-logs.entity';

export class BidLogsMapper {
  static toDomain(raw: BidLogsEntity): BidLogs {
    const domainEntity = new BidLogs();
    domainEntity.bidder = raw.bidder;

    domainEntity.amount = raw.amount;

    // **Map the bid**
    if (raw.bid_id) {
      const bid = raw.bid_id;
      domainEntity.bid_id = {
        id: bid.id,
        amount: bid.amount,
        created_at: bid.created_at,
        domain_id: {
          id: bid.domain_id.id,
          status: bid.domain_id.status,
          current_highest_bid: bid.domain_id.current_highest_bid,
          url: bid.domain_id.url,
        },
        auction_id: {
          id: bid.auction_id.id,
          start_time: bid.auction_id.start_time,
          end_time: bid.auction_id.end_time,
          status: bid.auction_id.status,
          current_winner: bid.auction_id.current_winner,
          highest_bid: bid.auction_id.highest_bid,
          current_bid: bid.auction_id.current_bid,
          reserve_price: bid.auction_id.reserve_price,
        },
      };
    }

    domainEntity.id = raw.id;
    domainEntity.created_at = raw.created_at;
    domainEntity.updated_at = raw.updated_at;

    return domainEntity;
  }

  static toPersistence(domainEntity: BidLogs): BidLogsEntity {
    const persistenceEntity = new BidLogsEntity();
    persistenceEntity.bidder = domainEntity.bidder;

    persistenceEntity.amount = domainEntity.amount;

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }

    if (domainEntity.bid_id) {
      persistenceEntity.bid_id = domainEntity.bid_id as BidEntity;
    }
    persistenceEntity.created_at = domainEntity.created_at;
    persistenceEntity.updated_at = domainEntity.updated_at;

    return persistenceEntity;
  }
}
