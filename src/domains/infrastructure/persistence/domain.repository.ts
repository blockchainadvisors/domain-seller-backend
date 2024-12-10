import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Domain } from '../../domain/domain';

export abstract class DomainRepository {
  abstract create(
    data: Omit<Domain, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Domain>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Domain[]>;

  abstract findById(id: Domain['id']): Promise<NullableType<Domain>>;

  abstract findByIds(ids: Domain['id'][]): Promise<Domain[]>;

  abstract update(
    id: Domain['id'],
    payload: DeepPartial<Domain>,
  ): Promise<Domain | null>;

  abstract remove(id: Domain['id']): Promise<void>;

  abstract findAuctionActiveWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Domain[]>;

  abstract findMyDomainsWithPagination(
    {
      paginationOptions,
    }: {
      paginationOptions: IPaginationOptions;
    },
    user_id: string,
  ): Promise<Domain[]>;
}
