import {
  BadRequestException,
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentRepository } from './infrastructure/persistence/payment.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Payment } from './domain/payment';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { BidEntity } from '../bids/infrastructure/persistence/relational/entities/bid.entity';
import { MailService } from '../mail/mail.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { AuctionsService } from '../auctions/auctions.service';
import { DomainsService } from '../domains/domains.service';
import { BidsService } from '../bids/bids.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  constructor(
    // Dependencies here
    private readonly auctionService: AuctionsService,
    private readonly domainService: DomainsService,
    private readonly paymentRepository: PaymentRepository,
    private readonly configService: ConfigService<AllConfigType>,
    private mailService: MailService,
    @Inject(forwardRef(() => BidsService))
    private readonly bidsService: BidsService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (this.stripe = new Stripe(
      this.configService.getOrThrow('payment.stripeSecretKey', { infer: true }),
    )),
      {
        apiVersion: '2022-11-15',
      };
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const payment = await this.paymentRepository.create({
      user_id: createPaymentDto.user_id as UserEntity,
      amount: createPaymentDto.amount,
      status: 'PENDING',
      bid_id: createPaymentDto.bid_id as BidEntity,
      auction_id: createPaymentDto.auction_id,
    });

    // Call mailer service to send payment link
    void this.mailService.sendPaymentLink({
      to: createPaymentDto.user_id.email ?? '',
      data: {
        domainName: createPaymentDto.bid_id.domain_id.url,
        amount: createPaymentDto.amount,
        firstName: createPaymentDto.user_id.first_name ?? '',
      },
    });

    return payment;
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.paymentRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Payment['id']) {
    return this.paymentRepository.findById(id);
  }

  findByIds(ids: Payment['id'][]) {
    return this.paymentRepository.findByIds(ids);
  }

  async update(
    id: Payment['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updatePaymentDto: UpdatePaymentDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.paymentRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: Payment['id']) {
    return this.paymentRepository.remove(id);
  }

  async findAllByUserIdWithPagination(
    user_id: string,
    options: { page: number; limit: number; status?: string },
  ): Promise<Payment[]> {
    return this.paymentRepository.findAllByUserIdWithPagination(
      user_id,
      options,
    );
  }

  async initiatePayment(paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) throw new Error('Payment not found');

    if (payment.status === 'PROCESSING')
      throw new BadRequestException('Payment in Processing state');

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }),
    );
    // Create Stripe session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'GBP',
            product_data: {
              name: `Payment for ${payment.bid_id.domain_id.url}`,
            },
            unit_amount: payment.amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${url}/payment/success`,
      cancel_url: `${url}/payment/cancel`,
    });

    // Update payment status to PAYMENT_PROCESSING
    await this.paymentRepository.update(paymentId, {
      status: 'PROCESSING',
      stripe_id: session.id,
      payment_url: session.url || '',
    });

    await this.auctionService.updateStatus(
      payment.bid_id.auction_id.id,
      'PAYMENT_PROCESSING',
    );

    return { payment_url: session.url };
  }

  async completePayment(paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment || !payment.stripe_id) {
      throw new Error('Payment or Stripe session not found');
    }
    // Retrieve Stripe session
    const session = await this.stripe.checkout.sessions.retrieve(
      payment.stripe_id,
    );
    const auction = await this.auctionService.findById(payment.auction_id.id);
    if (!auction) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { auction: 'notExists', message: 'Auction does not exists' },
      });
    }

    if (session.payment_status === 'paid') {
      const currentTime = new Date();
      await this.paymentRepository.update(paymentId, { status: 'PAID' });
      await this.auctionService.updateStatus(
        payment.auction_id.id,
        'PAYMENT_COMPLETED',
      );
      console.log('auction.domain_id.id');
      console.log(auction.domain_id.id);
      console.log(payment.user_id.id);
      console.log(currentTime);
      console.log(auction.current_bid);
      await this.domainService.update(auction.domain_id.id, {
        status: 'PAYMENT_COMPLETED',
        current_owner: payment.user_id.id,
        registration_date: currentTime,
        renewal_price: auction.current_bid,
      });
    } else {
      await this.paymentRepository.update(paymentId, { status: 'FAILED' });
      const currentTime = new Date();
      if (payment.auction_id.end_time <= currentTime) {
        await this.auctionService.updateStatus(
          payment.auction_id.id,
          'PAYMENT_FAILED',
        );
        await this.domainService.updateStatus(auction.domain_id.id, 'LISTED');
      } else {
        const bidsCount = await this.bidsService.findCountByAuctionId(
          payment.auction_id.id,
        );
        if (bidsCount > 0) {
          await this.auctionService.updateStatus(
            payment.auction_id.id,
            'ACTIVE',
          );
          await this.domainService.updateStatus(
            auction.domain_id.id,
            'BID_RECIEVED',
          );
        } else {
          await this.auctionService.updateStatus(
            payment.auction_id.id,
            'ACTIVE',
          );
          await this.domainService.updateStatus(
            auction.domain_id.id,
            'AUCTION_ACTIVE',
          );
        }
      }
    }

    return this.paymentRepository.findById(paymentId);
  }

  async findAllPendingPayments(): Promise<Payment[]> {
    return this.paymentRepository.findAllPendingPayments();
  }

  async updateStatus(paymentId: string, status: string) {
    await this.paymentRepository.update(paymentId, { status });
  }

  findByBidId(bidId: string) {
    return this.paymentRepository.findByBidId(bidId);
  }
}
