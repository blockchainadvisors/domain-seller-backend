import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { Expose } from 'class-transformer';
import { Bid } from '../../bids/domain/bid';
import { Domain } from '../../domains/domain/domain';

export class DnsSettings {
  @ApiProperty({
    type: () => String,
    nullable: false,
  })
  owner_id: string;

  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  @Expose()
  user_id: Pick<User, 'id' | 'email' | 'first_name' | 'last_name'>;

  @ApiProperty()
  @Expose()
  bid_id: Pick<
    Bid,
    'amount' | 'id' | 'domain_id' | 'user_id' | 'auction_id' | 'created_at'
  >;

  @ApiProperty()
  @Expose()
  domain_id: Pick<
    Domain,
    'id' | 'current_highest_bid' | 'status' | 'url' | 'created_at'
  >;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({
    type: 'array',
    description: 'Buyer’s DNS records, provided as an array of JSON objects.',
  })
  buyer_dns: Record<string, any>[];

  @ApiProperty({
    type: 'array',
    description: 'Buyer’s nameservers, provided as an array of strings.',
  })
  buyer_nameservers: string[];

  @ApiProperty({
    type: 'string',
    enum: ['PENDING', 'UPDATED'],
    default: 'PENDING',
    description: 'The current status of the DNS setup.',
  })
  dns_status: 'PENDING' | 'UPDATED';

  @ApiProperty({
    type: 'string',
    enum: ['PENDING', 'CREATED', 'CANCELLED', 'ACCEPTED'],
    default: 'PENDING',
    description: 'The current status of the transfer.',
  })
  transfer_status: 'CREATED' | 'CANCELLED' | 'ACCEPTED';

  @ApiProperty({
    type: Boolean,
    default: false,
    description: 'Indicates whether the domain ownership has been transferred.',
  })
  ownership_transferred: boolean;
}
