import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { BidLogs } from '../../domain/bid-logs';

export abstract class BidLogsRepository {
  abstract create(
    data: Omit<BidLogs, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<BidLogs>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<BidLogs[]>;

  abstract findById(id: BidLogs['id']): Promise<NullableType<BidLogs>>;

  abstract findByIds(ids: BidLogs['id'][]): Promise<BidLogs[]>;

  abstract update(
    id: BidLogs['id'],
    payload: DeepPartial<BidLogs>,
  ): Promise<BidLogs | null>;

  abstract remove(id: BidLogs['id']): Promise<void>;
}
