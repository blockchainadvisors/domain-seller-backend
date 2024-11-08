import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { Bid } from '../../bids/domain/bid';

export class Payment {
  @ApiProperty({
    type: String,
    nullable: true,
  })
  stripe_id: string;

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

  @ApiProperty({
    type: () => User,
  })
  user_id: User;

  @ApiProperty({
    type: () => Bid,
  })
  bid_id: Bid;

  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
