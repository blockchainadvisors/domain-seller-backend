// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateDomainDto } from './create-domain.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateDomainDto extends PartialType(CreateDomainDto) {
  @ApiProperty({
    required: false,
    type: () => String,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({
    required: false,
    type: () => String,
  })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({
    required: false,
    type: () => String,
  })
  @IsOptional()
  @IsString()
  current_owner?: string;

  @ApiProperty({
    required: false,
    type: () => Number,
  })
  @IsOptional()
  @IsString()
  renewal_price?: number;

  @ApiProperty({
    required: false,
    type: () => Date,
  })
  @IsOptional()
  @IsString()
  registration_date?: Date;

  @ApiProperty({
    required: false,
    type: () => Date,
  })
  @IsOptional()
  @IsString()
  expiry_date?: Date;
}
