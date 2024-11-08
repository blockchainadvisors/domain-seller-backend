import { Module } from '@nestjs/common';
import { AuctionRepository } from '../auction.repository';
import { AuctionRelationalRepository } from './repositories/auction.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionEntity } from './entities/auction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuctionEntity])],
  providers: [
    {
      provide: AuctionRepository,
      useClass: AuctionRelationalRepository,
    },
  ],
  exports: [AuctionRepository],
})
export class RelationalAuctionPersistenceModule {}
