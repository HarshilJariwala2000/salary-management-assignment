import type { DataSource } from 'typeorm';
import { CountryEntity } from './entities/CountryEntity';

const countries = [
  { name: 'India', isoCode: 'IN', currencyCode: 'INR' },
  { name: 'United States', isoCode: 'US', currencyCode: 'USD' },
  { name: 'United Kingdom', isoCode: 'GB', currencyCode: 'GBP' },
  { name: 'Germany', isoCode: 'DE', currencyCode: 'EUR' },
  { name: 'Singapore', isoCode: 'SG', currencyCode: 'SGD' },
  { name: 'Brazil', isoCode: 'BR', currencyCode: 'BRL' },
];

/** Inserts the fixed lists if they are missing. Safe to run on every boot. */
export async function ensureReferenceData(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(CountryEntity);
  if ((await repo.count()) === 0) await repo.insert(countries);
}
