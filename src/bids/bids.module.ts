import { UsersModule } from '../users/users.module';
import { DomainsModule } from '../domains/domains.module';
import { Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { RelationalBidPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AuctionsModule } from '../auctions/auctions.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    UsersModule,

    DomainsModule,

    AuctionsModule,

    MailModule,

    // import modules, etc.
    RelationalBidPersistenceModule,
  ],
  controllers: [BidsController],
  providers: [BidsService],
  exports: [BidsService, RelationalBidPersistenceModule],
})
export class BidsModule {}
