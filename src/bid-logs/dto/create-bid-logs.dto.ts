import {
  // decorators here

  IsNumber,
  IsString,
} from 'class-validator';

import {
  // decorators here
  ApiProperty,
} from '@nestjs/swagger';
import { Bid } from '../../bids/domain/bid';
import { Type } from 'class-transformer';

export class CreateBidLogsDto {
  @ApiProperty({
    required: true,
    type: () => String,
  })
  @IsString()
  bidder: string;

  @ApiProperty({
    required: true,
    type: () => Number,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({ type: Bid, required: false })
  @Type(() => Bid)
  bid_id: Bid;
}
