import {
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';

import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'session',
})
export class SessionEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, {
    eager: true,
  })
  @Index()
  user: UserEntity;

  @Column()
  hash: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;
}
