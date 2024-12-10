import { UsersModule } from '../users/users.module';
import { DomainsModule } from '../domains/domains.module';
import { forwardRef, Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { RelationalBidPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AuctionsModule } from '../auctions/auctions.module';
import { PaymentsModule } from '../payments/payments.module';
import { MailModule } from '../mail/mail.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    UsersModule,

    DomainsModule,

    // PaymentsModule,
    forwardRef(() => PaymentsModule), // Use forwardRef here

    SettingsModule,

    forwardRef(() => AuctionsModule),

    MailModule,

    // import modules, etc.
    RelationalBidPersistenceModule,
  ],
  controllers: [BidsController],
  providers: [BidsService],
  exports: [BidsService, RelationalBidPersistenceModule],
})
export class BidsModule {}
