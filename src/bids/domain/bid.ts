import { Auction } from '../../auctions/domain/auction';
import { Domain } from '../../domains/domain/domain';
import { User } from '../../users/domain/user';
import { ApiProperty } from '@nestjs/swagger';

export class Bid {
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
    type: () => Domain,
  })
  domain_id: Domain;

  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: Auction,
  })
  auction_id: Auction;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
