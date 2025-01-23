import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Auction } from '../../auctions/domain/auction';
import { User } from '../../users/domain/user';

export class Offers {
  @ApiProperty({
    type: () => String,
    nullable: true,
  })
  status: string;

  @ApiProperty({
    type: () => Number,
    nullable: false,
  })
  offer_amount: number;

  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  @Expose() // Expose this field in the transformation
  user_id: Pick<User, 'id' | 'email' | 'first_name' | 'last_name'>;

  @ApiProperty()
  @Expose() // Expose this field in the transformation
  auction_id: Pick<
    Auction,
    'id' | 'start_time' | 'end_time' | 'status' | 'current_winner' | 'domain_id'
  >;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
