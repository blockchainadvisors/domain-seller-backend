import { IsString, IsIn, Min, IsInt, IsIP } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDnsRecordsDto {
  @ApiProperty({ type: String })
  @IsString()
  // @IsIP()
  data: string;

  @ApiProperty({ type: String })
  @IsString()
  name: string;

  @ApiProperty({ type: Number })
  @IsInt()
  @Min(600) // Minimum TTL value is 600
  ttl: number;

  @ApiProperty({ type: String })
  @IsString()
  type: string;
}
