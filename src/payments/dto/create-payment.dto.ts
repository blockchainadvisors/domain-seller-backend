import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsNumber } from 'class-validator';
import { User } from '../../users/domain/user';
import { Bid } from '../../bids/domain/bid';
import { Auction } from '../../auctions/domain/auction';

export class CreatePaymentDto {
  @ApiProperty({
    required: true,
    type: () => String,
  })
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    required: true,
    type: () => Number,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({ type: User })
  @Type(() => User)
  user_id: User;

  @ApiProperty({ type: Bid, required: false })
  @Type(() => Bid)
  bid_id: Bid;

  @ApiProperty({ type: Auction, required: true })
  @Type(() => Auction)
  auction_id: Auction;
}
