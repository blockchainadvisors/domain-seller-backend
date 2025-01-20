import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { DomainRepository } from './infrastructure/persistence/domain.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Domain } from './domain/domain';

@Injectable()
export class DomainsService {
  constructor(
    // Dependencies here
    private readonly domainRepository: DomainRepository,
  ) {}

  private validateDomainName(domain: string): void {
    const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]{1,63}\.)+[a-zA-Z]{2,63}$/;
    if (!domainRegex.test(domain)) {
      throw new BadRequestException(
        'Invalid domain name. Ensure it conforms to the correct domain format and does not include http:// or https://.',
      );
    }
  }

  async create(createDomainDto: CreateDomainDto) {
    // Do not remove comment below.
    // <creating-property />
    this.validateDomainName(createDomainDto.url);

    const domainName = await this.domainRepository.findByName(
      createDomainDto.url,
    );
    if (domainName) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        error: 'domain name already exists',
      });
    }

    const status = 'LISTED';

    return this.domainRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      current_highest_bid: createDomainDto.current_highest_bid,

      status,
      description: createDomainDto.description,
      category: createDomainDto.category,

      url: createDomainDto.url,
    });
  }

  async createMany(createDomainMany: CreateDomainDto[]) {
    return this.domainRepository.createManyRaw(createDomainMany);
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.domainRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Domain['id']) {
    return this.domainRepository.findById(id);
  }

  findByIds(ids: Domain['id'][]) {
    return this.domainRepository.findByIds(ids);
  }

  async update(
    id: Domain['id'],

    updateDomainDto: UpdateDomainDto,
  ) {
    // Do not remove comment below.
    // <updating-property />
    console.log('why');
    console.log(updateDomainDto);
    return this.domainRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      id,

      current_highest_bid: updateDomainDto.current_highest_bid,

      status: updateDomainDto.status,

      description: updateDomainDto.description,

      url: updateDomainDto.url,
      registration_date: updateDomainDto.registration_date,
      renewal_price: updateDomainDto.renewal_price,
      current_owner: updateDomainDto.current_owner,
      expiry_date: updateDomainDto.expiry_date,
    });
  }

  remove(id: Domain['id']) {
    return this.domainRepository.remove(id);
  }

  async updateStatus(domainId: string, status: string) {
    await this.domainRepository.update(domainId, { status });
  }

  async updateCurrentHighestBid(domainId: string, amount: number) {
    await this.domainRepository.update(domainId, {
      current_highest_bid: amount,
    });
  }

  findAuctionActiveDomains({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.domainRepository.findAuctionActiveWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  async findMyDomainsWithPagination(
    {
      paginationOptions,
    }: {
      paginationOptions: IPaginationOptions;
    },
    userId: string,
  ) {
    const myDomain = await this.domainRepository.findMyDomainsWithPagination(
      {
        paginationOptions: {
          page: paginationOptions.page,
          limit: paginationOptions.limit,
        },
      },
      userId,
    );

    return myDomain;
    //this.filterDomainsResponse(myDomain);
  }
}
