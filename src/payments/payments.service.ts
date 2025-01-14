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
      {
        infer: true,
      },
    );

    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed.', err.message);
      // Respond with 200 OK even on signature verification failure to avoid retries from Stripe
      return res.status(200).send();
    }

    try {
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
    } catch (err) {
      // Log any unexpected errors to debug
      console.error('Error processing event:', err.message);
    }

    // Always respond with 200 OK
    res.status(200).send();
  }

  async handlePaymentSuccess(paymentObject: any) {
    console.log('handlePaymentSuccess');
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
    const durationMonths = Number(auction.expiry_duration)|| 1
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

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
      renewal_price: auction.current_bid,
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
}
