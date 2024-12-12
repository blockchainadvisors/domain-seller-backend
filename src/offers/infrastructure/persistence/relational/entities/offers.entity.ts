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
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { AuctionEntity } from '../../../../../auctions/infrastructure/persistence/relational/entities/auction.entity';

@Entity({
  name: 'offers',
})
export class OffersEntity extends EntityRelationalHelper {
  @Column({
    nullable: true,
    type: String,
  })
  status: string;

  @Column({
    nullable: false,
    type: 'decimal',
    precision: 18,
  })
  offer_amount: number;

  @ManyToOne(() => UserEntity, {
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user_id: UserEntity;

  @ManyToOne(() => AuctionEntity, { eager: true })
  @JoinColumn({ name: 'auction_id' })
  auction_id: AuctionEntity;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
