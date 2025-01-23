import { forwardRef, Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { RelationalOffersPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AuctionsModule } from '../auctions/auctions.module';
import { DomainsModule } from '../domains/domains.module';
import { UsersModule } from '../users/users.module';

import { BidsModule } from '../bids/bids.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    // import modules, etc.
    forwardRef(() => AuctionsModule),
    RelationalOffersPersistenceModule,
    UsersModule,
    forwardRef(() => BidsModule),
    DomainsModule,
    PaymentsModule,
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService, RelationalOffersPersistenceModule],
})
export class OffersModule {}
