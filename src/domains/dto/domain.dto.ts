import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DomainDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
