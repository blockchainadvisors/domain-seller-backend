import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsArray,
  ArrayNotEmpty,
  IsObject,
  IsIn,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateDnsSettingsDto {
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
    type: [Object],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsObject({ each: true })
  buyer_dns: object[]; // DNS records for the buyer (array of JSON objects)

  @ApiProperty({
    required: true,
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  buyer_nameservers: string[]; // Nameservers for the buyer (array of strings)

  @ApiProperty({
    required: true,
    type: [Object],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsObject({ each: true })
  default_dns: object[]; // Default DNS records for the seller (array of JSON objects)

  @ApiProperty({
    required: true,
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsObject({ each: true })
  default_nameservers: string[]; // Default Nameservers for the seller (array of JSON objects)

  @ApiProperty({
    required: true,
    type: String,
    enum: ['PENDING', 'UPDATED'],
  })
  @IsIn(['PENDING', 'UPDATED'])
  dns_status: 'PENDING' | 'UPDATED'; // Ensuring only 'PENDING' or 'UPDATED' are allowed

  @ApiProperty({
    required: true,
    type: Boolean,
  })
  @IsBoolean()
  ownership_transferred: boolean; // Ownership transfer status
}
