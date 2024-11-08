import { Module } from '@nestjs/common';
import { DomainsService } from './domains.service';
import { DomainsController } from './domains.controller';
import { RelationalDomainPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalDomainPersistenceModule,
  ],
  controllers: [DomainsController],
  providers: [DomainsService],
  exports: [DomainsService, RelationalDomainPersistenceModule],
})
export class DomainsModule {}
