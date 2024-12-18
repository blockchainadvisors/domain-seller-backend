import { Module } from '@nestjs/common';
import { BidLogsService } from './bid-logs.service';
import { BidLogsController } from './bid-logs.controller';
import { RelationalBidLogsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalBidLogsPersistenceModule,
  ],
  controllers: [BidLogsController],
  providers: [BidLogsService],
  exports: [BidLogsService, RelationalBidLogsPersistenceModule],
})
export class BidLogsModule {}
