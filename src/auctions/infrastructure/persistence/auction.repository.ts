import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Auction } from '../../domain/auction';

export abstract class AuctionRepository {
  abstract create(
    data: Omit<Auction, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Auction>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Auction[]>;

  abstract findById(id: Auction['id']): Promise<NullableType<Auction>>;

  abstract findByIds(ids: Auction['id'][]): Promise<Auction[]>;

  abstract update(
    id: Auction['id'],
    payload: DeepPartial<Auction>,
  ): Promise<Auction | null>;

  abstract remove(id: Auction['id']): Promise<void>;

  abstract getAuctionsForProcessing(): Promise<Auction[]>;

  abstract findActiveDomainsWithDetails({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<any[]>;
}
