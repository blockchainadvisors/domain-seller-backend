import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { DnsSettings } from '../../domain/dns-settings';

export abstract class DnsSettingsRepository {
  abstract create(
    data: Omit<DnsSettings, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<DnsSettings>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<DnsSettings[]>;

  abstract findById(id: DnsSettings['id']): Promise<NullableType<DnsSettings>>;

  abstract findByBidId(bidId: string): Promise<NullableType<DnsSettings>>;

  abstract findByIds(ids: DnsSettings['id'][]): Promise<DnsSettings[]>;

  abstract update(
    id: DnsSettings['id'],
    payload: DeepPartial<DnsSettings>,
  ): Promise<DnsSettings | null>;

  abstract remove(id: DnsSettings['id']): Promise<void>;
}
