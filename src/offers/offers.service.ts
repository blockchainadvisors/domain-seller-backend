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

@Injectable()
export class OffersService {
  constructor(
    // Dependencies here
    private readonly offersRepository: OffersRepository,
    private readonly userService: UsersService,

    private readonly bidsService: BidsService,

    private readonly auctionService: AuctionsService,
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

    if (
      (auction_id.end_time && currentTime > auction_id.end_time) ||
      auction_id.status === 'LEASE_PENDING'
    ) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { auction: 'hasEnded' },
      });
    }

    const bidsCount = await this.bidsService.findCountByAuctionId(
      auction_id.id,
    );

    if (bidsCount > 0) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { auction_id: 'offerNotAvailabe' },
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
