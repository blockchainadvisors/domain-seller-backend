import { Module } from '@nestjs/common';
import { BidLogsRepository } from '../bid-logs.repository';
import { BidLogsRelationalRepository } from './repositories/bid-logs.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidLogsEntity } from './entities/bid-logs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BidLogsEntity])],
  providers: [
    {
      provide: BidLogsRepository,
      useClass: BidLogsRelationalRepository,
    },
  ],
  exports: [BidLogsRepository],
})
export class RelationalBidLogsPersistenceModule {}
