import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BidLogsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
