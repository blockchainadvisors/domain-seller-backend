import { DomainsModule } from '../domains/domains.module';
import { forwardRef, Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionSchedulerService } from './auctions.scheduler.service';
import { AuctionsController } from './auctions.controller';
import { RelationalAuctionPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

import { PaymentsModule } from '../payments/payments.module';

import { SettingsModule } from '../settings/settings.module';

import { BidsModule } from '../bids/bids.module';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    DomainsModule,
    SettingsModule,
    UsersModule,
    forwardRef(() => PaymentsModule), // Use forwardRef here
    forwardRef(() => BidsModule), // Keep BidsModule as forwardRef
    RelationalAuctionPersistenceModule,
  ],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionSchedulerService],
  exports: [AuctionsService, RelationalAuctionPersistenceModule],
})
export class AuctionsModule {}
