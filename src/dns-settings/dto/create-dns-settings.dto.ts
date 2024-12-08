import {
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsIn,
  ValidateNested,
  Min,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Subclass to represent a DNS record
class DnsRecord {
  @ApiProperty({ type: String })
  @IsString()
  data: string;

  @ApiProperty({ type: String })
  @IsString()
  name: string;

  @ApiProperty({ type: Number, required: false })
  @IsInt()
  @Min(1)
  port: number;

  @ApiProperty({ type: Number, required: false })
  @IsInt()
  priority: number;

  @ApiProperty({ type: String, required: false })
  @IsString()
  protocol: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  service: string;

  @ApiProperty({ type: Number })
  @IsInt()
  @Min(600) // Minimum TTL value is 600
  ttl: number;

  @ApiProperty({ type: String })
  @IsString()
  @IsIn(['A', 'NS', 'CNAME', 'MX', 'TXT']) // Restrict valid types
  type: string;

  @ApiProperty({ type: Number, required: false })
  @IsInt()
  weight: number;
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
