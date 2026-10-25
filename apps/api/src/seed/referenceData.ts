/**
 * The fixed lists (countries, departments, roles) plus the parameters the seed
 * generator uses to make realistic data. Pure data: imports nothing.
 */

export interface CountryReference {
  name: string;
  isoCode: string;
  currencyCode: string;
  /** Share of the workforce in this country. Weights sum to 1. */
  weight: number;
  /** Faker locale used for realistic names. */
  fakerLocale: 'en_IN' | 'en_US' | 'en_GB' | 'de' | 'en' | 'pt_BR';
  /** Converts a role's base pay (in USD) into this country's local currency, level of pay included. */
  salaryFactor: number;
}

export interface RoleReference {
  name: string;
  department: string;
  /** Typical annual pay in USD, before the country factor. */
  basePayUsd: number;
  /** Relative headcount weight. */
  weight: number;
}

export const countries: CountryReference[] = [
  { name: 'India', isoCode: 'IN', currencyCode: 'INR', weight: 0.4, fakerLocale: 'en_IN', salaryFactor: 18 },
  { name: 'United States', isoCode: 'US', currencyCode: 'USD', weight: 0.25, fakerLocale: 'en_US', salaryFactor: 1 },
  { name: 'United Kingdom', isoCode: 'GB', currencyCode: 'GBP', weight: 0.12, fakerLocale: 'en_GB', salaryFactor: 0.55 },
  { name: 'Germany', isoCode: 'DE', currencyCode: 'EUR', weight: 0.1, fakerLocale: 'de', salaryFactor: 0.62 },
  { name: 'Singapore', isoCode: 'SG', currencyCode: 'SGD', weight: 0.08, fakerLocale: 'en', salaryFactor: 0.9 },
  { name: 'Brazil', isoCode: 'BR', currencyCode: 'BRL', weight: 0.05, fakerLocale: 'pt_BR', salaryFactor: 1.6 },
];

/** Each role belongs to exactly one department (D-009). */
export const roles: RoleReference[] = [
  { name: 'Software Engineer', department: 'Engineering', basePayUsd: 110_000, weight: 30 },
  { name: 'Senior Software Engineer', department: 'Engineering', basePayUsd: 150_000, weight: 14 },
  { name: 'Engineering Manager', department: 'Engineering', basePayUsd: 185_000, weight: 4 },
  { name: 'QA Engineer', department: 'Engineering', basePayUsd: 90_000, weight: 8 },
  { name: 'Product Manager', department: 'Product', basePayUsd: 140_000, weight: 6 },
  { name: 'Product Designer', department: 'Product', basePayUsd: 115_000, weight: 5 },
  { name: 'Data Analyst', department: 'Product', basePayUsd: 95_000, weight: 6 },
  { name: 'Account Executive', department: 'Sales', basePayUsd: 100_000, weight: 8 },
  { name: 'Sales Manager', department: 'Sales', basePayUsd: 145_000, weight: 3 },
  { name: 'Sales Development Representative', department: 'Sales', basePayUsd: 65_000, weight: 7 },
  { name: 'Financial Analyst', department: 'Finance', basePayUsd: 90_000, weight: 4 },
  { name: 'Accountant', department: 'Finance', basePayUsd: 75_000, weight: 4 },
  { name: 'Finance Manager', department: 'Finance', basePayUsd: 135_000, weight: 2 },
  { name: 'HR Business Partner', department: 'People', basePayUsd: 95_000, weight: 3 },
  { name: 'Recruiter', department: 'People', basePayUsd: 75_000, weight: 4 },
];

export const departments: string[] = [...new Set(roles.map((r) => r.department))];
