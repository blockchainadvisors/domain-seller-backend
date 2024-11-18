import { Auction } from '../../auctions/domain/auction';
import { Domain } from '../../domains/domain/domain';
import { User } from '../../users/domain/user';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class Bid {
  @ApiProperty({
    type: () => Number,
    nullable: false,
  })
  @Expose() // Expose this field in the transformation
  amount: number;

  @ApiProperty()
  @Expose() // Expose this field in the transformation
  user_id: Pick<User, 'id' | 'email' | 'first_name' | 'last_name'>;

  @ApiProperty()
  @Expose() // Expose this field in the transformation
  domain_id: Pick<Domain, 'id' | 'status' | 'current_highest_bid' | 'url'>;

  @ApiProperty({
    type: String,
  })
  @Expose() // Expose this field in the transformation
  id: string;

  @ApiProperty()
  @Expose() // Expose this field in the transformation
  auction_id: Pick<Auction, 'id' | 'start_time' | 'end_time'>;

  @ApiProperty()
  @Expose() // Expose this field in the transformation
  created_at: Date;

  @ApiProperty()
  @Expose() // Expose this field in the transformation
  updated_at: Date;
}
