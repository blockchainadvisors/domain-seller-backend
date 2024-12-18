import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { BidEntity } from '../../../../../bids/infrastructure/persistence/relational/entities/bid.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { AuctionEntity } from '../../../../../auctions/infrastructure/persistence/relational/entities/auction.entity';

@Entity({
  name: 'payment',
})
export class PaymentEntity extends EntityRelationalHelper {
  @Column({
    nullable: false,
    type: String,
  })
  status: string;

  @Column({
    nullable: true,
    type: String,
  })
  stripe_id?: string | null;

  @Column({
    nullable: true,
    type: String,
  })
  payment_url?: string | null;

  @Column({
    nullable: false,
    type: 'decimal',
    precision: 18, // Allows larger values
    scale: 2, // Suitable for two decimal places (currency)
  })
  amount: number;

  @ManyToOne(() => UserEntity, {
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user_id: UserEntity;

  @ManyToOne(() => AuctionEntity, {
    eager: true,
  })
  @JoinColumn({ name: 'auction_id' })
  auction_id: AuctionEntity;

  @ManyToOne(() => BidEntity, {
    eager: true,
  })
  @JoinColumn({ name: 'bid_id' })
  bid_id: BidEntity;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
