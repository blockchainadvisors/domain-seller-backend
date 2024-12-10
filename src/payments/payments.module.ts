import { forwardRef, Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { RelationalPaymentPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { MailModule } from '../mail/mail.module';
import { AuctionsModule } from '../auctions/auctions.module';
import { DomainsModule } from '../domains/domains.module';
import { BidsModule } from '../bids/bids.module';

@Module({
  imports: [
    MailModule,

    forwardRef(() => AuctionsModule),

    forwardRef(() => DomainsModule),

    forwardRef(() => BidsModule), // Add BidsModule here

    // import modules, etc.
    RelationalPaymentPersistenceModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService, RelationalPaymentPersistenceModule],
})
export class PaymentsModule {}
