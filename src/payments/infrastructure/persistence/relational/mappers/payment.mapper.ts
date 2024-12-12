import { BidEntity } from '../../../../../bids/infrastructure/persistence/relational/entities/bid.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { Payment } from '../../../../domain/payment';
import { PaymentEntity } from '../entities/payment.entity';

export class PaymentMapper {
  static toDomain(raw: PaymentEntity): Payment {
    const domainEntity = new Payment();

    domainEntity.status = raw.status;

    domainEntity.amount = raw.amount;

    if (raw.stripe_id) {
      domainEntity.stripe_id = raw.stripe_id;
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

    if (domainEntity.user_id) {
      persistenceEntity.user_id = domainEntity.user_id as UserEntity;
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
