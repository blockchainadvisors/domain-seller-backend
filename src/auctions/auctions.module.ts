import { DomainsModule } from '../domains/domains.module';
import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { RelationalAuctionPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    DomainsModule,

    // import modules, etc.
    RelationalAuctionPersistenceModule,
  ],
  controllers: [AuctionsController],
  providers: [AuctionsService],
  exports: [AuctionsService, RelationalAuctionPersistenceModule],
})
export class AuctionsModule {}
