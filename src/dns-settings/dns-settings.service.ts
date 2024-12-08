import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateDnsSettingsDto } from './dto/create-dns-settings.dto';
import { UpdateDnsSettingsDto } from './dto/update-dns-settings.dto';
import { DnsSettingsRepository } from './infrastructure/persistence/dns-settings.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { DnsSettings } from './domain/dns-settings';
import { UsersService } from '../users/users.service';
import { DomainsService } from '../domains/domains.service';
import { BidsService } from '../bids/bids.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class DnsSettingsService {
  private readonly godaddyBaseUrl: string;
  private readonly godaddyKey: string;
  private readonly godaddySecret: string;
  private readonly godaddyCustomerId: string;
  constructor(
    private readonly dnsSettingsRepository: DnsSettingsRepository,

    private readonly userService: UsersService,

    private readonly domainService: DomainsService,

    private readonly bidService: BidsService,

    private readonly paymentsService: PaymentsService,

    private readonly configService: ConfigService<AllConfigType>,
  ) {
    this.godaddyKey = this.configService.getOrThrow('dnssettings.godaddyKey', {
      infer: true,
    });

    this.godaddyBaseUrl = this.configService.getOrThrow(
      'dnssettings.godaddyBaseUrl',
      { infer: true },
    );

    this.godaddySecret = this.configService.getOrThrow(
      'dnssettings.godaddySecret',
      { infer: true },
    );
    this.godaddyCustomerId = this.configService.getOrThrow(
      'dnssettings.godaddyCustomerId',
      { infer: true },
    );
  }

  async create(createDnsSettingsDto: CreateDnsSettingsDto) {
    // Validate at least two NS records
    const nsRecords = createDnsSettingsDto.buyer_dns.filter(
      (record) => record.type === 'NS',
    );
    if (nsRecords.length < 2) {
      throw new BadRequestException(
        'At least two NS records must be specified.',
      );
    }

    const user = await this.userService.findById(createDnsSettingsDto.user_id);
    if (!user)
      throw new UnprocessableEntityException({
        errors: { user_id: 'notExists' },
      });

    const bid = await this.bidService.findById(createDnsSettingsDto.bid_id);
    if (!bid)
      throw new UnprocessableEntityException({
        errors: { bid_id: 'notExists' },
      });

    if (user.id != bid.user_id.id)
      throw new UnprocessableEntityException({
        errors: { bid_id: 'userNotOwnerOfBid' },
      });

    const domain = await this.domainService.findById(
      createDnsSettingsDto.domain_id,
    );
    if (!domain)
      throw new UnprocessableEntityException({
        errors: { domain_id: 'notExists' },
      });

    const payment = await this.paymentsService.findByBidId(bid.id);
    if (!payment || payment.status !== 'PAID') {
      throw new UnprocessableEntityException({
        errors: { payment: 'notSuccessful' },
      });
    }

    const existingDnsSettings = await this.dnsSettingsRepository.findByBidId(
      bid.id,
    );
    if (existingDnsSettings) {
      throw new UnprocessableEntityException({
        errors: { domain: 'dnsSettingsAlreadyExist' },
      });
    }

    // **Step 2: Use Buyer's or Default DNS/Nameservers**
    const dnsToApply = createDnsSettingsDto.buyer_dns;
    const nameserversToApply = createDnsSettingsDto.buyer_nameservers;

    // // **Step 3: Update DNS Records**
    await this.updateDnsRecords(domain.url, dnsToApply);

    // // **Step 4: Update Nameservers**
    await this.updateNameservers(domain.url, nameserversToApply);

    //**Step 5: Initiate Transfer**
    // const registrarResponse = await this.initiateTransfer({
    //   domainId: domain.url,
    //   buyerInfo: user
    // });

    // let transfer_status: 'PENDING' | 'CREATED' | 'CANCELLED' | 'ACCEPTED'
    // if (registrarResponse.status !== 'PENDING') {
    //     transfer_status = 'CREATED'
    // }else{
    //      transfer_status = 'PENDING'
    // }

    // **Step 6: Save DNS Settings**
    const dnsSettings = await this.dnsSettingsRepository.create({
      buyer_dns: createDnsSettingsDto.buyer_dns,
      buyer_nameservers: createDnsSettingsDto.buyer_nameservers,
      dns_status: 'UPDATED',
      ownership_transferred: false,
      transfer_status: 'PENDING',
      owner_id: createDnsSettingsDto.owner_id,
      user_id: user,
      bid_id: bid,
      domain_id: domain,
    });

    return dnsSettings;
  }

  async updateDnsRecords(domainId: string, dnsRecords: any[]) {
    const apiUrl = `${this.godaddyBaseUrl}/domains/${domainId}/records`;
    const headers = {
      Authorization: `sso-key ${this.godaddyKey}:${this.godaddySecret}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.put(apiUrl, dnsRecords, { headers });
      return response.data;
    } catch (error) {
      console.error('Error updating DNS records:', error);
      throw new InternalServerErrorException('Failed to update DNS records.');
    }
  }

  async updateNameservers(domainId: string, nameservers: string[]) {
    const apiUrl = `${this.godaddyBaseUrl}/customers/${this.godaddyCustomerId}/domains/${domainId}/nameServers`;
    const headers = {
      Authorization: `sso-key  ${this.godaddyKey}:${this.godaddySecret}`,
      'Content-Type': 'application/json',
    };
    const payload = { nameServers: nameservers };

    try {
      const response = await axios.put(apiUrl, payload, { headers });
      return response.data;
    } catch (error) {
      console.error('Error updating nameservers:', error);
      throw new InternalServerErrorException('Failed to update nameservers.');
    }
  }

  async acceptTransfer(domainId: string) {
    const apiUrl = `${this.godaddyBaseUrl}/customers/domains/${domainId}/transferInAccept`;
    const headers = {
      Authorization: `sso-key  ${this.godaddyKey}:${this.godaddySecret}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(apiUrl, {}, { headers });
      return response.data;
    } catch (error) {
      console.error('Error accepting transfer:', error);
      throw new InternalServerErrorException('Failed to accept transfer.');
    }
  }

  async cancelTransfer(domainId: string) {
    const apiUrl = `${this.godaddyBaseUrl}/customers/domains/${domainId}/transferInCancel`;
    const headers = {
      Authorization: `sso-key  ${this.godaddyKey}:${this.godaddySecret}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(apiUrl, {}, { headers });
      return response.data;
    } catch (error) {
      console.error('Error canceling transfer:', error);
      throw new InternalServerErrorException('Failed to cancel transfer.');
    }
  }

  async initiateTransfer({ domainId, buyerInfo }) {
    const apiUrl = `${this.godaddyBaseUrl}/customers/${this.godaddyCustomerId}/domains/${domainId}/transfer`;

    const headers = {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `sso-key ${process.env.GODADDY_KEY}:${process.env.GODADDY_SECRET}`,
    };

    const payload = {
      authCode: '888888',
      period: 1,
      renewAuto: true,
      privacy: false,
      identityDocumentId: '',
      consent: {
        agreementKeys: ['string'],
        price: 0,
        currency: 'USD',
        registryPremiumPricing: true,
        agreedBy: 'string',
        agreedAt: new Date().toISOString(),
        claimToken: 'string',
      },
      contacts: {
        admin: {
          encoding: 'ASCII',
          nameFirst: buyerInfo.firstName,
          nameMiddle: '',
          nameLast: buyerInfo.lastName,
          organization: buyerInfo.organization || '',
          jobTitle: '',
          email: buyerInfo.email,
          phone: buyerInfo.phone,
          fax: '',
          addressMailing: {
            address1: buyerInfo.address1,
            address2: '',
            city: buyerInfo.city,
            country: buyerInfo.country,
            postalCode: buyerInfo.postalCode,
            state: buyerInfo.state,
          },
          metadata: {},
        },
      },
    };

    try {
      const response = await axios.post(apiUrl, payload, { headers });
      return response.data;
    } catch (error) {
      console.error('Error initiating transfer:', error);
      throw new InternalServerErrorException('Failed to initiate transfer');
    }
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.dnsSettingsRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: DnsSettings['id']) {
    return this.dnsSettingsRepository.findById(id);
  }

  findByIds(ids: DnsSettings['id'][]) {
    return this.dnsSettingsRepository.findByIds(ids);
  }

  async update(
    id: DnsSettings['id'],
    updateDnsSettingsDto: UpdateDnsSettingsDto,
  ) {
    return this.dnsSettingsRepository.update(id, {
      owner_id: updateDnsSettingsDto.owner_id,
      buyer_dns: updateDnsSettingsDto.buyer_dns, // Update DNS fields
      buyer_nameservers: updateDnsSettingsDto.buyer_nameservers, // Update nameserver fields
      dns_status: updateDnsSettingsDto.dns_status, // Update DNS status
      ownership_transferred: updateDnsSettingsDto.ownership_transferred, // Update ownership transfer status
    });
  }

  remove(id: DnsSettings['id']) {
    return this.dnsSettingsRepository.remove(id);
  }
}
