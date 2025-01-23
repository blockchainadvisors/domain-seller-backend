import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateOffersDto } from './dto/create-offers.dto';
import { UpdateOffersDto } from './dto/update-offers.dto';
import { OffersRepository } from './infrastructure/persistence/offers.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Offers } from './domain/offers';
import { AuctionsService } from '../auctions/auctions.service';
import { UsersService } from '../users/users.service';
import { BidsService } from '../bids/bids.service';
import { PaymentsService } from '../payments/payments.service';
import { OffersEntity } from './infrastructure/persistence/relational/entities/offers.entity';
import { DataSource, QueryRunner } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class OffersService {
  constructor(
    // Dependencies here
    private readonly offersRepository: OffersRepository,
    private readonly userService: UsersService,

    private readonly bidsService: BidsService,

    private readonly auctionService: AuctionsService,
    private readonly paymentService: PaymentsService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async create(createOffersDto: CreateOffersDto, retrieved_user_id: string) {
    // Do not remove comment below.
    // <creating-property />
    //validate user details
    if (createOffersDto.user_id != retrieved_user_id) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { user_id: 'userIdMismatch' },
      });
    }

    // **Validate and fetch related entities**
    const user_id = await this.userService.findById(createOffersDto.user_id);
    if (!user_id) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { user_id: 'notExists' },
      });
    }

    const auction_id = await this.auctionService.findById(
      createOffersDto.auction_id,
    );
    if (!auction_id) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { auction_id: 'notExists' },
      });
    }

    const currentTime = new Date();
    if (auction_id.start_time && currentTime < auction_id.start_time) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { auction: 'notStarted' },
      });
    }

    if (auction_id.status !== 'ACTIVE' && auction_id.status !== 'DRAFT') {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          auction_id: 'leaseOngoing',
          message: 'Auction not available for offer',
        },
      });
    }

    if (auction_id.end_time && currentTime > auction_id.end_time) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { auction: 'hasEnded', message: 'Auction has ended' },
      });
    }

    const bidsCount = await this.bidsService.findCountByAuctionId(
      auction_id.id,
    );

    if (bidsCount > 0) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          auction_id: 'offerNotAvailabe',
          message: 'Aucition not available for offer',
        },
      });
    }

    return this.offersRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      status: 'PENDING',
      offer_amount: createOffersDto.offer_amount,

      auction_id: auction_id,

      user_id: user_id,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.offersRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Offers['id']) {
    return this.offersRepository.findById(id);
  }

  findByIds(ids: Offers['id'][]) {
    return this.offersRepository.findByIds(ids);
  }

  async approveOffer(id: Offers['id']) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      // Find the offer to ensure it exists
      const offer = await this.offersRepository.findById(id);

      if (!offer) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { auction_id: 'notExists', message: 'Offer not found' },
        });
      }
      const user_id = await this.userService.findById(offer.user_id.id);
      const auction_id = await this.auctionService.findById(
        offer.auction_id.id,
      );

      if (!user_id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { auction_id: 'notExists', message: 'user not found' },
        });
      }

      if (!auction_id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { auction_id: 'notExists', message: 'auction not found' },
        });
      }

      const offerRepository = manager.getRepository(OffersEntity);
      await offerRepository.update(id, {
        status: 'APPROVED',
      });

      // Decline all other offers with the same auctionId
      // await this.offersRepository.declineOtherOffers(offer.auction_id.id, id);
      // Decline all other offers for the same auction
      await manager
        .createQueryBuilder()
        .update(OffersEntity)
        .set({ status: 'DECLINED' })
        .where('auction_id = :auctionId', { auctionId: auction_id.id })
        .andWhere('id != :approvedOfferId', { approvedOfferId: id })
        .execute();

      const createPaymentRecord =
        await this.paymentService.initiateOfferPayment(
          auction_id,
          user_id,
          offer.offer_amount,
          offer.auction_id.domain_id.url,
        );
      console.log(createPaymentRecord);

      await queryRunner.commitTransaction();
      return { message: 'Successful' };
    } catch (error) {
      // **Rollback the transaction in case of error**
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // **Release the query runner to avoid memory leaks**
      await queryRunner.release();
    }
  }

  async declineOffer(id: Offers['id']) {
    // Find the offer to ensure it exists
    const offer = await this.offersRepository.findById(id);

    if (!offer) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { id: 'notExists', message: 'Offer not found' },
      });
    }

    // Decline the offer
    await this.offersRepository.declineOffer(id);
    return { message: 'Successful' };
  }

  async update(
    id: Offers['id'],

    updateOffersDto: UpdateOffersDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.offersRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      status: updateOffersDto.status,
    });
  }

  remove(id: Offers['id']) {
    return this.offersRepository.remove(id);
  }
}
