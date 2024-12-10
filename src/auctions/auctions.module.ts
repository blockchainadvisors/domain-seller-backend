import { DomainsModule } from '../domains/domains.module';
import { forwardRef, Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionSchedulerService } from './auctions.scheduler.service';
import { AuctionsController } from './auctions.controller';
import { RelationalAuctionPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

import { PaymentsModule } from '../payments/payments.module';

import { SettingsModule } from '../settings/settings.module';

import { BidsModule } from '../bids/bids.module';

@Module({
  imports: [
    DomainsModule,
    SettingsModule,
    forwardRef(() => PaymentsModule),
    forwardRef(() => PaymentsModule),
    forwardRef(() => BidsModule),
    RelationalAuctionPersistenceModule,
  ],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionSchedulerService],
  exports: [AuctionsService, RelationalAuctionPersistenceModule],
})
export class AuctionsModule {}
