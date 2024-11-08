import { UserDto } from '../../users/dto/user.dto';

import { BidDto } from '../../bids/dto/bid.dto';

import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsNumber } from 'class-validator';

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

  @ApiProperty({ type: UserDto })
  @Type(() => UserDto)
  user_id: UserDto;

  @ApiProperty({ type: BidDto })
  @Type(() => BidDto)
  bid_id: BidDto;
}
