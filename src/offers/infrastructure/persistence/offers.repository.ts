import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Offers } from '../../domain/offers';

export abstract class OffersRepository {
  abstract create(
    data: Omit<Offers, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Offers>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Offers[]>;

  abstract findById(id: Offers['id']): Promise<NullableType<Offers>>;

  abstract findByIds(ids: Offers['id'][]): Promise<Offers[]>;

  abstract update(
    id: Offers['id'],
    payload: DeepPartial<Offers>,
  ): Promise<Offers | null>;

  abstract remove(id: Offers['id']): Promise<void>;
}
