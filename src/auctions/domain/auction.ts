import { Domain } from '../../domains/domain/domain';
import { ApiProperty } from '@nestjs/swagger';

export class Auction {
  @ApiProperty({
    type: () => Number,
    nullable: false,
  })
  min_increment: number;

  @ApiProperty({
    type: () => Number,
    nullable: false,
  })
  reserve_price: number;

  @ApiProperty({
    type: () => Number,
    nullable: false,
  })
  lease_price: number;

  @ApiProperty({
    type: () => Number,
    nullable: false,
  })
  min_price: number;

  @ApiProperty({
    type: Date,
    nullable: false,
    format: 'date-time',
  })
  end_time: Date;

  @ApiProperty({
    type: Date,
    nullable: false,
    format: 'date-time',
  })
  start_time: Date;

  @ApiProperty({
    type: Date,
    nullable: true,
    format: 'date-time',
  })
  payment_created_at?: Date;

  @ApiProperty({
    type: () => Domain,
    nullable: false,
  })
  domain_id: Domain;

  @ApiProperty({
    type: () => String,
    nullable: false,
  })
  status?: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
  })
  current_winner?: string;

  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: () => Number,
    nullable: false,
  })
  expiry_duration: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
