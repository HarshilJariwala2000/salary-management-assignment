import { Faker, en } from '@faker-js/faker';
import { countries, roles } from './referenceData';

/** Joining dates fall within the last 15 years. */
const JOINING_WINDOW_DAYS = 15 * 365;

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

  const usedEmails = new Set<string>();

  return Array.from({ length: count }, () => {
    const fullName = faker.person.fullName();
    return {
      fullName,
      email: uniqueEmail(fullName, usedEmails),
      joiningDate: daysBefore(today, faker.number.int({ min: 0, max: JOINING_WINDOW_DAYS })),
      countryIsoCode: country.isoCode,
      roleName: role.name,
      annualCtc: Math.round(role.basePayUsd * country.salaryFactor),
    };
  });
}

/** firstname.lastname@acme.test, ASCII-folded and lower-cased, with a counter when the name repeats. */
function uniqueEmail(fullName: string, used: Set<string>): string {
  const local = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
  let email = `${local}@acme.test`;
  for (let n = 2; used.has(email); n++) email = `${local}.${n}@acme.test`;
  used.add(email);
  return email;
}

/** The ISO date `days` days before `isoDate`, computed in UTC so it never shifts with the time zone. */
function daysBefore(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}
