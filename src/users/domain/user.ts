import { Exclude, Expose } from 'class-transformer';
import { Role } from '../../roles/domain/role';
import { Status } from '../../statuses/domain/status';
import { ApiProperty } from '@nestjs/swagger';

const idType = String;

export class User {
  @ApiProperty({
    type: idType,
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
  })
  @Expose({ groups: ['me', 'admin'] })
  email: string | null;

  @Exclude({ toPlainOnly: true })
  password?: string;

  @ApiProperty({
    type: String,
    example: 'email',
  })
  @Expose({ groups: ['me', 'admin'] })
  provider: string;

  @ApiProperty({
    type: String,
    example: '1234567890',
  })
  @Expose({ groups: ['me', 'admin'] })
  social_id?: string | null;

  @ApiProperty({
    type: String,
    example: 'John',
  })
  first_name: string | null;

  @ApiProperty({
    type: String,
    example: 'Doe',
  })
  last_name: string | null;

  @ApiProperty({
    type: String,
    example: 'John',
  })
  @ApiProperty({
    type: () => Role,
  })
  role?: Role | null;

  @ApiProperty({
    type: () => Status,
  })
  status?: Status;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty()
  deleted_at: Date;
}
