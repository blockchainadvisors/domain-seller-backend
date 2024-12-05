import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { RelationalSettingsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalSettingsPersistenceModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService, RelationalSettingsPersistenceModule],
})
export class SettingsModule {}
