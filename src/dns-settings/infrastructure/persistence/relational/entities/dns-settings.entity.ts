import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { BidEntity } from '../../../../../bids/infrastructure/persistence/relational/entities/bid.entity';
import { DomainEntity } from '../../../../../domains/infrastructure/persistence/relational/entities/domain.entity';

@Entity({
  name: 'dns_settings',
})
export class DnsSettingsEntity extends EntityRelationalHelper {
  @Column({
    nullable: false,
    type: String,
  })
  owner_id: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb', { nullable: true })
  buyer_dns: Record<string, any>[];

  @Column('text', { array: true, nullable: true })
  buyer_nameservers: string[];

  @Column({ type: 'enum', enum: ['PENDING', 'UPDATED'], default: 'PENDING' })
  dns_status: 'PENDING' | 'UPDATED';

  @Column({
    type: 'enum',
    enum: ['CREATED', 'ACCEPTED', 'CANCELLED', 'PENDING'],
    default: 'CREATED',
  })
  transfer_status: 'CREATED' | 'ACCEPTED' | 'CANCELLED';

  @Column({ type: 'boolean', default: false })
  ownership_transferred: boolean;

  @ManyToOne(() => UserEntity, {
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user_id: UserEntity;

  @ManyToOne(() => BidEntity, {
    eager: true,
  })
  @JoinColumn({ name: 'bid_id' })
  bid_id: BidEntity;

  @ManyToOne(() => DomainEntity, {
    eager: true,
  })
  @JoinColumn({ name: 'domain_id' })
  domain_id: DomainEntity;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
