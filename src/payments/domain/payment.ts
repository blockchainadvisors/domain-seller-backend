import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { Bid } from '../../bids/domain/bid';
import { Expose } from 'class-transformer';
import { Auction } from '../../auctions/domain/auction';

export class Payment {
  @ApiProperty({
    type: String,
    nullable: true,
  })
  stripe_id?: string;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  payment_url?: string;

  @ApiProperty({
    type: String,
    nullable: false,
  })
  status: string;

  @ApiProperty({
    type: () => Number,
    nullable: false,
  })
  amount: number;

  @ApiProperty()
  @Expose() // Expose this field in the transformation
  user_id: Pick<User, 'id' | 'email' | 'first_name' | 'last_name'>;

  @ApiProperty()
  @Expose() // Expose this field in the transformation
  bid_id: Pick<
    Bid,
    'amount' | 'id' | 'domain_id' | 'user_id' | 'auction_id' | 'created_at'
  >;

  @ApiProperty()
  @Expose() // Expose this field in the transformation
  auction_id: Pick<
    Auction,
    | 'id'
    | 'start_time'
    | 'end_time'
    | 'status'
    | 'current_winner'
    | 'highest_bid'
    | 'current_bid'
    | 'domain_id'
  >;

  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
