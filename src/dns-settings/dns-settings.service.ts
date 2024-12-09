import {
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
    // const nameserversToApply = createDnsSettingsDto.buyer_nameservers;

    // // **Step 3: Update DNS Records**
    await this.updateDnsRecords(domain.url, dnsToApply);

    // // // **Step 4: Update Nameservers**
    // await this.updateNameservers(domain.url, nameserversToApply);

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
      transfer_status: 'CREATED',
      owner_id: createDnsSettingsDto.owner_id,
      user_id: user,
      bid_id: bid,
      domain_id: domain,
    });

    return dnsSettings;
  }

  async updateDnsRecords(domainId: string, dnsRecords: any[]) {
    const headers = {
      Authorization: `sso-key ${this.godaddyKey}:${this.godaddySecret}`,
      'Content-Type': 'application/json',
    };

    const updatePromises = dnsRecords.map(async (dnsRecord) => {
      const apiUrl = `${this.godaddyBaseUrl}/v1/domains/${domainId}/records/${dnsRecord.type}/${dnsRecord.name}`;
      try {
        const response = await axios.put(apiUrl, [dnsRecord], { headers });
        console.log(`DNS Record updated successfully: ${dnsRecord.name}`);
        return response.data;
      } catch (error) {
        console.error(
          `Error updating DNS record ${dnsRecord.name}:`,
          error.response?.data || error.message,
        );
        throw new Error(`Failed to update DNS record ${dnsRecord.name}.`);
      }
    });

    // Await all updates to complete
    const results = await Promise.all(updatePromises);
    return results;
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
