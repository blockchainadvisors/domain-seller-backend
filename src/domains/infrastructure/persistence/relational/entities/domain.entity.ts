import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'domain',
})
export class DomainEntity extends EntityRelationalHelper {
  @Column({
    nullable: true,
    type: 'decimal',
    precision: 18, // Allows larger values
    scale: 2, // Suitable for two decimal places (currency)
  })
  current_highest_bid?: number | null;

  @Column({
    nullable: false,
    type: String,
  })
  status?: string;

  @Column({
    nullable: true,
    type: String,
  })
  description?: string | null;

  @Column({
    nullable: false,
    type: String,
  })
  url: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
