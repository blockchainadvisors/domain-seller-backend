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
  @IsString()
  url: string;
}
