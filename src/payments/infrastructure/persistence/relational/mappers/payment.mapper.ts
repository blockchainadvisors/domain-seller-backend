import { BidEntity } from '../../../../../bids/infrastructure/persistence/relational/entities/bid.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { Payment } from '../../../../domain/payment';
import { PaymentEntity } from '../entities/payment.entity';

export class PaymentMapper {
  static toDomain(raw: PaymentEntity): Payment {
    const domainEntity = new Payment();

    domainEntity.status = raw.status;

    domainEntity.amount = raw.amount;

    domainEntity.user_id = raw.user_id;
    domainEntity.bid_id = raw.bid_id;
    domainEntity.id = raw.id;
    domainEntity.created_at = raw.created_at;
    domainEntity.updated_at = raw.updated_at;

    return domainEntity;
  }

  static toPersistence(domainEntity: Payment): PaymentEntity {
    const persistenceEntity = new PaymentEntity();

    persistenceEntity.amount = domainEntity.amount;

    let user: UserEntity | undefined = undefined;

    if (domainEntity.user_id) {
      user = new UserEntity();
      user.id = domainEntity.user_id.id;
    }

    let bid: BidEntity | undefined = undefined;

    if (domainEntity.bid_id) {
      bid = new BidEntity();
      bid.id = domainEntity.bid_id.id;
    }

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.created_at = domainEntity.created_at;
    persistenceEntity.updated_at = domainEntity.updated_at;

    return persistenceEntity;
  }
}
