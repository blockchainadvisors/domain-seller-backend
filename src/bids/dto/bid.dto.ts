import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BidDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
