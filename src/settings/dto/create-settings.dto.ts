import {
  // decorators here

  IsString,
  IsOptional,
} from 'class-validator';

import {
  // decorators here
  ApiProperty,
} from '@nestjs/swagger';

export class CreateSettingsDto {
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
  value: string;

  @ApiProperty({
    required: true,
    type: () => String,
  })
  @IsString()
  key: string;

  // Don't forget to use the class-validator decorators in the DTO properties.
}
