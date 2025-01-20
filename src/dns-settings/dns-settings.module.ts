import { Module } from '@nestjs/common';
import { DnsSettingsService } from './dns-settings.service';
import { DnsSettingsController } from './dns-settings.controller';
import { RelationalDnsSettingsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { UsersModule } from '../users/users.module';
import { DomainsModule } from '../domains/domains.module';
import { BidsModule } from '../bids/bids.module';
import { PaymentsModule } from '../payments/payments.module';
import { DnsSettingsSchedulerService } from './dns-settings.scheduler.service';

@Module({
  imports: [
    UsersModule,
    DomainsModule,
    BidsModule,
    PaymentsModule,

    // import modules, etc.
    RelationalDnsSettingsPersistenceModule,
  ],
  controllers: [DnsSettingsController],
  providers: [DnsSettingsService, DnsSettingsSchedulerService],
  exports: [DnsSettingsService, RelationalDnsSettingsPersistenceModule],
})
export class DnsSettingsModule {}
