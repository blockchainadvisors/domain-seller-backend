import { UserDto } from '../../users/dto/user.dto';

import { DomainDto } from '../../domains/dto/domain.dto';

import { AuctionDto } from '../../auctions/dto/auction.dto';

import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import {
  // decorators here

  IsNumber,
} from 'class-validator';

export class CreateBidDto {
  @ApiProperty({
    required: true,
    type: () => Number,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({ type: UserDto })
  @Type(() => UserDto)
  user_id: UserDto;

  @ApiProperty({ type: DomainDto })
  @Type(() => DomainDto)
  domain_id: DomainDto;

  @ApiProperty({ type: AuctionDto })
  @Type(() => AuctionDto)
  auction_id: AuctionDto;
}
