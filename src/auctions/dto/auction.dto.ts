import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuctionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
