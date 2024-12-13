import { DomainEntity } from '../../../../../domains/infrastructure/persistence/relational/entities/domain.entity';

import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'auction',
})
export class AuctionEntity extends EntityRelationalHelper {
  @Column({
    nullable: false,
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  min_increment: number;

  @Column({
    nullable: false,
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  reserve_price: number;

  @Column({
    nullable: true,
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  current_bid: number;

  @Column({
    nullable: true,
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  highest_bid: number;

  @Column({
    nullable: false,
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  lease_price: number;

  @Column({
    nullable: false,
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  expiry_duration: number;

  @Column({
    nullable: false,
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  min_price: number;

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

  @Column({
    nullable: false,
    type: String,
  })
  status?: string;

  @Column({
    nullable: true,
    type: String,
  })
  current_winner?: string;

  @ManyToOne(() => DomainEntity, (domain) => domain.auction, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'domain_id' })
  domain_id: DomainEntity;

  @Column({
    nullable: true,
    type: String,
  })
  winning_bid_id?: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
