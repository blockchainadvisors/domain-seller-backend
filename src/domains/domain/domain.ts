import { ApiProperty } from '@nestjs/swagger';

export class Domain {
  @ApiProperty({
    type: () => Number,
    nullable: true,
  })
  current_highest_bid?: number | null;

  @ApiProperty({
    type: () => String,
    nullable: false,
  })
  status?: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    type: () => String,
    nullable: false,
  })
  url: string;

  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
