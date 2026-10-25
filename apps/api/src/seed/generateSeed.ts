import { Faker, en } from '@faker-js/faker';
import { countries, roles } from './referenceData';

export interface SeedEmployee {
  fullName: string;
  email: string;
  joiningDate: string;
  countryIsoCode: string;
  roleName: string;
  annualCtc: number;
}

/**
 * Deterministic seed data: the same { count, seed, today } always yields the same employees.
 * Pure: no I/O, no clock (today is passed in), no global random state.
 */
export function generateSeed({ count, seed, today }: { count: number; seed: number; today: string }): SeedEmployee[] {
  const faker = new Faker({ locale: [en] });
  faker.seed(seed);
  const country = countries[0]!;
  const role = roles[0]!;

  return Array.from({ length: count }, () => {
    const fullName = faker.person.fullName();
    return {
      fullName,
      email: `${fullName.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@acme.test`,
      joiningDate: today,
      countryIsoCode: country.isoCode,
      roleName: role.name,
      annualCtc: Math.round(role.basePayUsd * country.salaryFactor),
    };
  });
}
