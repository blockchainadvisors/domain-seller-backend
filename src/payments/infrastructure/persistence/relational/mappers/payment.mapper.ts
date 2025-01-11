import { AuctionEntity } from '../../../../../auctions/infrastructure/persistence/relational/entities/auction.entity';
import { BidEntity } from '../../../../../bids/infrastructure/persistence/relational/entities/bid.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { Payment } from '../../../../domain/payment';
import { PaymentEntity } from '../entities/payment.entity';

export class PaymentMapper {
  static toDomain(raw: PaymentEntity): Payment {
    const domainEntity = new Payment();

    domainEntity.status = raw.status;

    domainEntity.amount = raw.amount;

    if (raw.payment_intent) {
      domainEntity.payment_intent = raw.payment_intent;
    }

    if (raw.stripe_id) {
      domainEntity.stripe_id = raw.stripe_id;
    }

    if (raw.payment_url) {
      domainEntity.payment_url = raw.payment_url;
    }
    // domainEntity.user_id = raw.user_id;
    domainEntity.bid_id = raw.bid_id;

    // **Map the user** and exclude password
    if (raw.user_id) {
      const user = raw.user_id;
      domainEntity.user_id = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
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
        domain_id: {
          id: auction.domain_id.id,
          status: auction.domain_id.status,
          current_highest_bid: auction.domain_id.current_highest_bid,
          url: auction.domain_id.url,
          created_at: auction.domain_id.created_at,
          updated_at: auction.domain_id.updated_at,
        },
      };
    }

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
        user_id: {
          id: bid.user_id.id,
          email: bid.user_id.email,
          first_name: bid.user_id.first_name,
          last_name: bid.user_id.last_name,
        },
      };
    }
    domainEntity.id = raw.id;
    domainEntity.created_at = raw.created_at;
    domainEntity.updated_at = raw.updated_at;

    return domainEntity;
  }

  static toPersistence(domainEntity: Payment): PaymentEntity {
    const persistenceEntity = new PaymentEntity();

    persistenceEntity.amount = domainEntity.amount;

    persistenceEntity.status = domainEntity.status;

    if (domainEntity.stripe_id) {
      persistenceEntity.stripe_id = domainEntity.stripe_id;
    }

    if (domainEntity.payment_intent) {
      persistenceEntity.payment_intent = domainEntity.payment_intent;
    }

    if (domainEntity.payment_url) {
      persistenceEntity.payment_url = domainEntity.payment_url;
    }

    if (domainEntity.user_id) {
      persistenceEntity.user_id = domainEntity.user_id as UserEntity;
    }

    if (domainEntity.auction_id) {
      persistenceEntity.auction_id = domainEntity.auction_id as AuctionEntity;
    }

    if (domainEntity.bid_id) {
      persistenceEntity.bid_id = domainEntity.bid_id as BidEntity;
    }

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.created_at = domainEntity.created_at;
    persistenceEntity.updated_at = domainEntity.updated_at;

    return persistenceEntity;
  }
}
