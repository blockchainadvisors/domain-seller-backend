import {
  IsString,
  IsEmail,
  IsOptional,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AddressMailingDto {
  @ApiProperty({ description: 'Street address line 1' })
  @IsString()
  address1: string;

  @ApiProperty({
    description: 'Street address line 2 (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  address2?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'State or region' })
  @IsString()
  state: string;

  @ApiProperty({ description: 'Country (ISO 3166-1 alpha-2)', example: 'US' })
  @Matches(/^[A-Z]{2}$/, {
    message: 'Country must be a valid ISO 3166-1 alpha-2 code',
  })
  country: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  postalCode: string;
}

class ContactDto {
  @ApiProperty({ type: AddressMailingDto, description: 'Mailing address' })
  @ValidateNested()
  @Type(() => AddressMailingDto)
  addressMailing: AddressMailingDto;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Fax number in international format',
    example: '+1.4805058802',
    required: false,
  })
  @IsOptional()
  @Matches(/^\+\d{1,4}\.\d{3,15}$/, {
    message: 'Fax must be in international format, e.g., +1.4805058802',
  })
  fax?: string;

  @ApiProperty({ description: 'First name of the contact' })
  @IsString()
  nameFirst: string;

  @ApiProperty({ description: 'Last name of the contact' })
  @IsString()
  nameLast: string;

  @ApiProperty({ description: 'Organization name (optional)', required: false })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiProperty({
    description: 'Phone number in international format',
    example: '+1.4805058800',
  })
  @Matches(/^\+\d{1,4}\.\d{3,15}$/, {
    message: 'Phone must be in international format, e.g., +1.4805058800',
  })
  phone: string;

  @ApiProperty({ description: 'Job title (optional)', required: false })
  @IsOptional()
  @IsString()
  jobTitle?: string;
}

export class UpdateContactsDto {
  @ApiProperty({ type: ContactDto, description: 'Admin contact details' })
  @ValidateNested()
  @Type(() => ContactDto)
  contactAdmin: ContactDto;

  @ApiProperty({ type: ContactDto, description: 'Billing contact details' })
  @ValidateNested()
  @Type(() => ContactDto)
  contactBilling: ContactDto;

  @ApiProperty({ type: ContactDto, description: 'Registrant contact details' })
  @ValidateNested()
  @Type(() => ContactDto)
  contactRegistrant: ContactDto;

  @ApiProperty({ type: ContactDto, description: 'Technical contact details' })
  @ValidateNested()
  @Type(() => ContactDto)
  contactTech: ContactDto;
}
