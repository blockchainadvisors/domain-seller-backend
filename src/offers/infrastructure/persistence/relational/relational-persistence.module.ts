import { Module } from '@nestjs/common';
import { OffersRepository } from '../offers.repository';
import { OffersRelationalRepository } from './repositories/offers.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersEntity } from './entities/offers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OffersEntity])],
  providers: [
    {
      provide: OffersRepository,
      useClass: OffersRelationalRepository,
    },
  ],
  exports: [OffersRepository],
})
export class RelationalOffersPersistenceModule {}
