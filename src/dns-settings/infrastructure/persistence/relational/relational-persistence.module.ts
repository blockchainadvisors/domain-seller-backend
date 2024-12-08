import { Module } from '@nestjs/common';
import { DnsSettingsRepository } from '../dns-settings.repository';
import { DnsSettingsRelationalRepository } from './repositories/dns-settings.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DnsSettingsEntity } from './entities/dns-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DnsSettingsEntity])],
  providers: [
    {
      provide: DnsSettingsRepository,
      useClass: DnsSettingsRelationalRepository,
    },
  ],
  exports: [DnsSettingsRepository],
})
export class RelationalDnsSettingsPersistenceModule {}
