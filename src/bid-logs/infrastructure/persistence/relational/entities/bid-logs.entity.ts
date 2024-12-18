import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { BidEntity } from '../../../../../bids/infrastructure/persistence/relational/entities/bid.entity';

@Entity({
  name: 'bid_logs',
})
export class BidLogsEntity extends EntityRelationalHelper {
  @Column({
    nullable: false,
    type: String,
  })
  bidder: string;

  @Column({
    nullable: false,
    type: Number,
  })
  amount: number;

  @ManyToOne(() => BidEntity, {
    eager: true,
  })
  @JoinColumn({ name: 'bid_id' })
  bid_id: BidEntity;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
