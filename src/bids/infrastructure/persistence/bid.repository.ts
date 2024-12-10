import { Auction } from '../../../auctions/domain/auction';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Bid } from '../../domain/bid';

export abstract class BidRepository {
  abstract create(
    data: Omit<Bid, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Bid>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Bid[]>;

  abstract findMyBidWithPagination(
    {
      paginationOptions,
    }: {
      paginationOptions: IPaginationOptions;
    },
    user_id: string,
  ): Promise<Bid[]>;

  abstract findById(id: Bid['id']): Promise<NullableType<Bid>>;

  abstract findByIds(ids: Bid['id'][]): Promise<Bid[]>;

  abstract update(
    id: Bid['id'],
    payload: DeepPartial<Bid>,
  ): Promise<Bid | null>;

  abstract remove(id: Bid['id']): Promise<void>;

  abstract findHighestBidder(id: Auction['id']): Promise<NullableType<Bid>>;

  abstract findNextHighestBidder(
    id: Auction['id'],
    currentHighestAmount: number,
  ): Promise<NullableType<Bid>>;
}
