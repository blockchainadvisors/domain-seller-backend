import { BadRequestException, Injectable } from '@nestjs/common';
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
    const domainRegex = /^[^.\\s]{1,63}(\.[^.\\s]{1,63}){1,2}$/;
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

    return this.domainRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      id,

      current_highest_bid: updateDomainDto.current_highest_bid,

      status: updateDomainDto.status,

      description: updateDomainDto.description,

      url: updateDomainDto.url,
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
}
