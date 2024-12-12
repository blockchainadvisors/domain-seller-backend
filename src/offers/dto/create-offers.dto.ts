import {
  // decorators here

  IsNumber,
  IsString,
  IsNotEmpty,
} from 'class-validator';

import {
  // decorators here
  ApiProperty,
} from '@nestjs/swagger';

export class CreateOffersDto {
  @ApiProperty({
    required: true,
    type: () => Number,
  })
  @IsNumber()
  offer_amount: number;

  @ApiProperty({
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  auction_id: string;
}
