import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  OneToOne,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { AuctionEntity } from '../../../../../auctions/infrastructure/persistence/relational/entities/auction.entity';

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
  category?: string;

  @Column({
    nullable: true,
    type: String,
  })
  description?: string | null;

  @Column({
    nullable: false,
    type: String,
    unique: true,
  })
  url: string;

  @Column({
    nullable: true,
    type: 'timestamp',
  })
  registration_date?: Date;

  @Column({
    nullable: true,
    type: 'timestamp',
  })
  expiry_date?: Date;

  @Column({
    nullable: true,
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  renewal_price?: number;

  @Column({
    nullable: true,
    type: String,
  })
  current_owner?: string | null;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToOne(() => AuctionEntity, (auction) => auction.domain_id)
  auction: AuctionEntity;
}
