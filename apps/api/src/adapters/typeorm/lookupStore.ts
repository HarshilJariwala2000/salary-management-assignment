import type { DataSource } from 'typeorm';
import type { LookupStore } from '../../logic/ports';
import { CountryEntity } from './entities/CountryEntity';

export function createLookupStore(dataSource: DataSource): LookupStore {
  return {
    async all() {
      const countries = await dataSource.getRepository(CountryEntity).find({ order: { name: 'ASC' } });
      return {
        countries: countries.map(({ id, name, isoCode, currencyCode }) => ({ id, name, isoCode, currencyCode })),
      };
    },
  };
}
