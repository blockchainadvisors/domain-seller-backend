import { Type } from 'class-transformer';

import {
  IsNumber,
  IsDate,
  IsString,
  Min, // Import Min decorator
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateAuctionDto {
  @ApiProperty({
    required: true,
    type: Number,
  })
  @IsNumber()
  @Min(0.01) // Ensures min_increment is greater than 0
  min_increment: number;

  @ApiProperty({
    required: true,
    type: Number,
  })
  @IsNumber()
  @Min(0.01) // Ensures reserve_price is greater than 0
  reserve_price: number;

  @ApiProperty({
    required: true,
    type: Date,
    description: 'Auction end time in date-time format',
    format: 'date-time',
  })
  @IsDate()
  @Type(() => Date) // Ensures correct date transformation
  end_time: Date;

  @ApiProperty({
    required: true,
    type: Date,
    description: 'Auction start time in date-time format',
    format: 'date-time',
  })
  @IsDate()
  @Type(() => Date) // Ensures correct date transformation
  start_time: Date;

  @ApiProperty({
    required: true,
    type: String,
  })
  @IsString()
  domain_id: string;
}
