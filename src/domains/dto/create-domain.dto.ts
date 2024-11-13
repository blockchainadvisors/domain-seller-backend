import {
  // decorators here

  IsString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

import {
  // decorators here
  ApiProperty,
} from '@nestjs/swagger';

export class CreateDomainDto {
  current_highest_bid?: number | null;

  status?: string;

  @ApiProperty({
    required: false,
    type: () => String,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({
    required: true,
    type: () => String,
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  // Don't forget to use the class-validator decorators in the DTO properties.
}
