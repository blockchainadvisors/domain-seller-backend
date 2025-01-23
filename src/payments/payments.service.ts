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
import { DataSource, QueryRunner } from 'typeorm';
import { AuctionEntity } from '../auctions/infrastructure/persistence/relational/entities/auction.entity';
import { PaymentEntity } from './infrastructure/persistence/relational/entities/payment.entity';
import { DomainEntity } from '../domains/infrastructure/persistence/relational/entities/domain.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { Auction } from '../auctions/domain/auction';
import { User } from '../users/domain/user';

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
    @InjectDataSource() private readonly dataSource: DataSource,
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
    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }),
    );

    const stripeSession = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'GBP',
            product_data: {
              name: `Payment for ${createPaymentDto.auction_id.domain_id.url}`,
            },
            unit_amount: Number(createPaymentDto.amount) * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${url}/payment/success-page`,
      cancel_url: `${url}/payment/failed-page`,
    });
    if (!stripeSession.url!) {
      throw new Error('Error from stripe, no payment link');
    }

    const payment = await this.paymentRepository.create({
      user_id: createPaymentDto.user_id as UserEntity,
      amount: createPaymentDto.amount,
      status: 'PROCESSING',
      bid_id: createPaymentDto.bid_id as BidEntity,
      auction_id: createPaymentDto.auction_id,
      payment_url: stripeSession.url,
      stripe_id: stripeSession.id,
    });

    // Call mailer service to send payment link
    void this.mailService.sendPaymentLink({
      to: createPaymentDto.user_id.email ?? '',
      data: {
        domainName: createPaymentDto.bid_id.domain_id.url,
        amount: createPaymentDto.amount,
        firstName: createPaymentDto.user_id.first_name ?? '',
        paymentUrl: stripeSession.url,
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
    retrieved_user_id: string,
    options: { page: number; limit: number; status?: string },
  ): Promise<Payment[]> {
    //validate user details
    if (user_id != retrieved_user_id) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { user_id: 'userIdMismatch', message: 'User Id Mismatch' },
      });
    }

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
      success_url: `${url}/payment/success-page`,
      cancel_url: `${url}/payment/failed-page`,
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

  async completePayment(req: any, res: any, rawBody: Buffer) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = this.configService.getOrThrow(
      'payment.stripeEndpointSecret',
      { infer: true },
    );

    let event: any;

    try {
      // Attempt to construct the Stripe event
      event = this.stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);

      switch (event.type) {
        case 'checkout.session.completed': {
          const paymentObject = event.data.object;

          if (paymentObject.payment_status === 'paid') {
            await this.handlePaymentSuccess(paymentObject);
          } else {
            await this.handlePaymentFailure(paymentObject);
          }
          break;
        }
        default:
          console.log(`Unhandled event type ${event.type}`);
          break;
      }

      // Respond with 200 OK after successfully processing the event
      res.status(200).send();
    } catch (err) {
      // Respond with 400 in case of errors
      res.status(400).send();
      console.error('Error processing event:', err.message);
    }
  }

  async handlePaymentSuccess(paymentObject: any) {
    const payment = await this.paymentRepository.findByStripeId(
      paymentObject.id,
    );
    if (!payment) {
      console.error(`Payment with Stripe ID ${paymentObject.id} not found.`);
      return;
    }

    const auction = await this.auctionService.findById(payment.auction_id.id);
    if (!auction) {
      console.error(`Auction with ID ${payment.auction_id.id} not found.`);
      return;
    }

    const currentTime = new Date();

    // Calculate expiry_date
    const expiryDate = new Date(currentTime);
    const durationMonths = Number(auction.expiry_duration) || 1;
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
    const renewalPrice =
      Number(paymentObject.amount_total) / 100 || auction.current_bid;

    // Update payment status and related entities
    await this.paymentRepository.update(payment.id, {
      status: 'PAID',
      payment_intent: paymentObject.payment_intent,
    });
    await this.auctionService.updateStatus(
      payment.auction_id.id,
      'PAYMENT_COMPLETED',
    );
    await this.domainService.update(auction.domain_id.id, {
      status: 'PAYMENT_COMPLETED',
      current_owner: payment.user_id.id,
      registration_date: currentTime,
      renewal_price: renewalPrice,
      expiry_date: expiryDate,
    });

    console.log(`Payment ${payment.id} completed successfully.`);
    return;
  }

  async handlePaymentFailure(paymentObject: any) {
    console.log('handlePaymentFailure');
    const payment = await this.paymentRepository.findByStripeId(
      paymentObject.id,
    );
    if (!payment) {
      console.error(`Payment with Stripe ID ${paymentObject.id} not found.`);
      return;
    }

    const auction = await this.auctionService.findById(payment.auction_id.id);
    if (!auction) {
      console.error(`Auction with ID ${payment.auction_id.id} not found.`);
      return;
    }

    const currentTime = new Date();
    await this.paymentRepository.update(payment.id, { status: 'FAILED' });

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
        await this.auctionService.updateStatus(payment.auction_id.id, 'ACTIVE');
        await this.domainService.updateStatus(
          auction.domain_id.id,
          'BID_RECIEVED',
        );
      } else {
        await this.auctionService.updateStatus(payment.auction_id.id, 'ACTIVE');
        await this.domainService.updateStatus(
          auction.domain_id.id,
          'AUCTION_ACTIVE',
        );
      }
    }

    console.log(`Payment ${payment.id} failed.`);
    return;
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

  async initiateOfferPayment(
    auction_id: Auction,
    user_id: User,
    amount: number,
    domainUrl: string,
  ) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

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
                name: `Payment for ${domainUrl}`,
              },
              unit_amount: amount * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${url}/payment/success-page`,
        cancel_url: `${url}/payment/failed-page`,
      });

      // **Create bid**: Now that user_id, domain_id, and auction_id are resolved, create the bid entity
      const newPayment = manager.create(PaymentEntity, {
        user_id: user_id as UserEntity,
        amount: amount,
        auction_id: auction_id as AuctionEntity,
        status: 'PROCESSING',
        stripe_id: session.id,
        payment_url: session.url,
      });

      // Save the new bid
      await manager.save(newPayment);

      // **Update domain status if it's the first bid**
      const domainRepository = queryRunner.manager.getRepository(DomainEntity);
      await domainRepository.update(auction_id.domain_id.id, {
        status: 'OFFER_PENDING',
      });

      // **Update domain status if it's the first bid**
      const auctionRepository =
        queryRunner.manager.getRepository(AuctionEntity);
      await auctionRepository.update(auction_id.id, {
        status: 'OFFER_PENDING',
        current_bid: amount,
        current_winner: user_id.id,
      });

      // **Commit the transaction**
      await queryRunner.commitTransaction();

      //const getPayment = await this.paymentService.findById(newPayment.id);
      return { payment_url: session.url };
    } catch (error) {
      // **Rollback the transaction in case of error**
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // **Release the query runner to avoid memory leaks**
      await queryRunner.release();
    }
  }
}
