import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';

import { DomainEntity } from '../../../../../domains/infrastructure/persistence/relational/entities/domain.entity';

import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { AuctionEntity } from '../../../../../auctions/infrastructure/persistence/relational/entities/auction.entity';

@Entity({
  name: 'bid',
})
export class BidEntity extends EntityRelationalHelper {
  @Column({
    nullable: false,
    type: 'decimal',
    precision: 18,
  })
  amount: number;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user_id: UserEntity;

  @ManyToOne(() => DomainEntity, { eager: true })
  @JoinColumn({ name: 'domain_id' })
  domain_id: DomainEntity;

  @ManyToOne(() => AuctionEntity, { eager: true })
  @JoinColumn({ name: 'auction_id' })
  auction_id: AuctionEntity;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
