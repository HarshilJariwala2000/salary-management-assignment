import { Faker, base, de, en, en_GB, en_IN, en_US, pt_BR, type LocaleDefinition } from '@faker-js/faker';
import { countries, roles, type CountryReference } from './referenceData';

/** Spread of pay within a pay group (standard deviation of the log-normal noise). */
const PAY_SPREAD = 0.15;
/** Share of employees deliberately paid far above or below their pay group. */
const OUTLIER_RATE = 0.01;

/** Joining dates fall within the last 15 years. */
const JOINING_WINDOW_DAYS = 15 * 365;

const locales: Record<CountryReference['fakerLocale'], LocaleDefinition> = { en_IN, en_US, en_GB, de, en, pt_BR };

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
  const faker = seeded(new Faker({ locale: [en, base] }), seed);
  // One name generator per country, each with its own seed, so names look local.
  const namesByCountry = new Map(
    countries.map((c, i) => [c.isoCode, seeded(new Faker({ locale: [locales[c.fakerLocale], en, base] }), seed + i + 1)]),
  );
  const usedEmails = new Set<string>();

  return Array.from({ length: count }, () => {
    const country = faker.helpers.weightedArrayElement(countries.map((c) => ({ weight: c.weight, value: c })));
    const role = faker.helpers.weightedArrayElement(roles.map((r) => ({ weight: r.weight, value: r })));
    const names = namesByCountry.get(country.isoCode)!;
    // firstName + lastName rather than fullName(), which sometimes adds titles and suffixes.
    const fullName = `${names.person.firstName()} ${names.person.lastName()}`;
    return {
      fullName,
      email: uniqueEmail(fullName, usedEmails),
      joiningDate: daysBefore(today, faker.number.int({ min: 0, max: JOINING_WINDOW_DAYS })),
      countryIsoCode: country.isoCode,
      roleName: role.name,
      annualCtc: annualCtc(faker, role.basePayUsd * country.salaryFactor),
    };
  });
}

/**
 * Typical pay x log-normal noise, rounded to the nearest 100. About 1% are planted
 * outliers (roughly 2x or 0.5x typical pay) so the top/bottom view has something to show.
 */
function annualCtc(faker: Faker, typicalPay: number): number {
  // Box-Muller: a standard normal sample from two uniform ones.
  const u1 = faker.number.float({ min: Number.EPSILON, max: 1 });
  const u2 = faker.number.float({ min: 0, max: 1 });
  const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  let pay = typicalPay * Math.exp(PAY_SPREAD * normal);
  if (faker.number.float({ min: 0, max: 1 }) < OUTLIER_RATE) {
    pay *= faker.datatype.boolean() ? faker.number.float({ min: 1.8, max: 2.4 }) : faker.number.float({ min: 0.42, max: 0.55 });
  }
  return Math.max(100, Math.round(pay / 100) * 100);
}

function seeded(faker: Faker, seed: number): Faker {
  faker.seed(seed);
  return faker;
}

/** firstname.lastname@acme.test, ASCII-folded and lower-cased, with a counter when the name repeats. */
function uniqueEmail(fullName: string, used: Set<string>): string {
  const local = fullName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
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
