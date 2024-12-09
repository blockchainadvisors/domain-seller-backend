import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiateTransferDto {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsString()
  auth_code: string;
}
