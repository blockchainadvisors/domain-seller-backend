// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateAuctionDto } from './create-auction.dto';
import { Type } from 'class-transformer';
import { IsNumber, Min, IsDate } from 'class-validator';

export class UpdateAuctionDto extends PartialType(CreateAuctionDto) {
  @ApiProperty({
    required: false,
    type: Number,
  })
  @IsNumber()
  @Min(0.01) // Ensures min_increment is greater than 0
  min_increment: number;

  @ApiProperty({
    required: false,
    type: Number,
  })
  @IsNumber()
  @Min(0.01) // Ensures reserve_price is greater than 0
  reserve_price: number;

  @ApiProperty({
    required: false,
    type: Date,
    description: 'Auction end time in date-time format',
    format: 'date-time',
  })
  @IsDate()
  @Type(() => Date) // Ensures correct date transformation
  end_time: Date;

  @ApiProperty({
    required: false,
    type: Date,
    description: 'Auction start time in date-time format',
    format: 'date-time',
  })
  @IsDate()
  @Type(() => Date) // Ensures correct date transformation
  start_time: Date;
}
