import { Module } from '@nestjs/common';
import { DomainRepository } from '../domain.repository';
import { DomainRelationalRepository } from './repositories/domain.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainEntity } from './entities/domain.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DomainEntity])],
  providers: [
    {
      provide: DomainRepository,
      useClass: DomainRelationalRepository,
    },
  ],
  exports: [DomainRepository],
})
export class RelationalDomainPersistenceModule {}
