import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Bid } from '../../bids/domain/bid';

export class BidLogs {
  @ApiProperty({
    type: () => String,
    nullable: false,
  })
  bidder: string;

  @ApiProperty({
    type: () => Number,
    nullable: false,
  })
  amount: number;

  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  @Expose() // Expose this field in the transformation
  bid_id: Pick<
    Bid,
    'amount' | 'id' | 'domain_id' | 'auction_id' | 'created_at'
  >;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
