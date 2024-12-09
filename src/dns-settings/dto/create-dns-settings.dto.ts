import {
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsIn,
  ValidateNested,
  Min,
  IsInt,
  IsIP,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Subclass to represent a DNS record
class DnsRecord {
  @ApiProperty({ type: String })
  @IsString()
  @IsIP()
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
  @IsIn(['A']) // Restrict valid types
  type: string;
}

export class CreateDnsSettingsDto {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsString()
  owner_id: string;

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
  domain_id: string;

  @ApiProperty({
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  bid_id: string;

  @ApiProperty({
    required: true,
    type: [DnsRecord],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DnsRecord)
  buyer_dns: DnsRecord[];

  @ApiProperty({
    required: true,
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  buyer_nameservers: string[];
}
