import { ApiProperty } from '@nestjs/swagger';

export class Settings {
  @ApiProperty({
    type: () => String,
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    type: () => String,
    nullable: false,
  })
  value: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
  })
  key: string;

  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
