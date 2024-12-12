import { BidEntity } from '../../../../../bids/infrastructure/persistence/relational/entities/bid.entity';
import { DomainEntity } from '../../../../../domains/infrastructure/persistence/relational/entities/domain.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { DnsSettings } from '../../../../domain/dns-settings';

import { DnsSettingsEntity } from '../entities/dns-settings.entity';

export class DnsSettingsMapper {
  static toDomain(raw: DnsSettingsEntity): DnsSettings {
    const domainEntity = new DnsSettings();
    domainEntity.owner_id = raw.owner_id;

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
        last_name: user.last_name,
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
        created_at: domain.created_at,
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

    // Map buyer DNS and nameservers
    if (raw.buyer_dns) {
      domainEntity.buyer_dns = raw.buyer_dns;
    }
    if (raw.buyer_nameservers) {
      domainEntity.buyer_nameservers = raw.buyer_nameservers;
    }

    // Map DNS status
    domainEntity.dns_status = raw.dns_status;

    domainEntity.transfer_status = raw.transfer_status;

    // Map ownership transferred
    domainEntity.ownership_transferred = raw.ownership_transferred;

    return domainEntity;
  }

  static toPersistence(domainEntity: DnsSettings): DnsSettingsEntity {
    const persistenceEntity = new DnsSettingsEntity();
    persistenceEntity.owner_id = domainEntity.owner_id;

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.created_at = domainEntity.created_at;
    persistenceEntity.updated_at = domainEntity.updated_at;

    if (domainEntity.user_id) {
      persistenceEntity.user_id = domainEntity.user_id as UserEntity;
    }

    if (domainEntity.bid_id) {
      persistenceEntity.bid_id = domainEntity.bid_id as BidEntity;
    }

    if (domainEntity.domain_id) {
      persistenceEntity.domain_id = domainEntity.domain_id as DomainEntity;
    }

    // Persist buyer DNS and nameservers
    if (domainEntity.buyer_dns) {
      persistenceEntity.buyer_dns = domainEntity.buyer_dns;
    }
    if (domainEntity.buyer_nameservers) {
      persistenceEntity.buyer_nameservers = domainEntity.buyer_nameservers;
    }

    // Persist DNS status
    persistenceEntity.dns_status = domainEntity.dns_status;

    persistenceEntity.transfer_status = domainEntity.transfer_status;

    // Persist ownership transferred
    persistenceEntity.ownership_transferred =
      domainEntity.ownership_transferred;

    return persistenceEntity;
  }
}
