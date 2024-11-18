import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentRepository } from './infrastructure/persistence/payment.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Payment } from './domain/payment';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { BidEntity } from '../bids/infrastructure/persistence/relational/entities/bid.entity';
import { MailService } from '../mail/mail.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  constructor(
    // Dependencies here
    private readonly paymentRepository: PaymentRepository,
    private mailService: MailService,
  ) {}
  async create(createPaymentDto: CreatePaymentDto) {
    const payment = await this.paymentRepository.create({
      user_id: createPaymentDto.user_id as UserEntity,
      amount: createPaymentDto.amount,
      status: 'PENDING',
      bid_id: createPaymentDto.bid_id as BidEntity,
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
    paginationOptions: IPaginationOptions,
  ) {
    return this.paymentRepository.findAllByUserIdWithPagination(
      user_id,
      paginationOptions,
    );
  }
}
