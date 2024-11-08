import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow, IsNotEmpty } from 'class-validator';

export class AuthAppleLoginDto {
  @ApiProperty({ example: 'abc' })
  @IsNotEmpty()
  idToken: string;

  @Allow()
  @ApiPropertyOptional()
  first_name?: string;

  @Allow()
  @ApiPropertyOptional()
  last_name?: string;
}
