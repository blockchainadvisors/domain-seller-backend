import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class IncreaseBidDto {
  @ApiProperty({
    required: true,
    type: () => Number,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  auction_id: string;
}
