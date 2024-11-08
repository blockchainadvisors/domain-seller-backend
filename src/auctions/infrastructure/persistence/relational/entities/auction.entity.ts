import { DomainEntity } from '../../../../../domains/infrastructure/persistence/relational/entities/domain.entity';

import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  Column,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'auction',
})
export class AuctionEntity extends EntityRelationalHelper {
  @Column({
    nullable: false,
    type: 'decimal',
    precision: 18, // Allows larger values
    scale: 2, // Suitable for two decimal places (currency)
  })
  min_increment: number;

  @Column({
    nullable: false,
    type: 'decimal',
    precision: 18, // Allows larger values
    scale: 2, // Suitable for two decimal places (currency)
  })
  reserve_price: number;

  @Column({
    nullable: false,
    type: 'timestamp',
  })
  end_time: Date;

  @Column({
    nullable: false,
    type: 'timestamp',
  })
  start_time: Date;

  @OneToOne(() => DomainEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'domain_id' })
  domain_id: DomainEntity;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
