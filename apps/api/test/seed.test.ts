import { describe, expect, it } from 'vitest';
import { generateSeed } from '../src/seed/generateSeed';

const today = '2026-06-30';

describe('generateSeed', () => {
  it('generates the requested number of employees, identically for the same inputs', () => {
    const first = generateSeed({ count: 50, seed: 42, today });
    const second = generateSeed({ count: 50, seed: 42, today });

    expect(first).toHaveLength(50);
    expect(second).toEqual(first);
  });

  it('gives every employee a unique, lower-case email, even when names repeat', () => {
    const emails = generateSeed({ count: 2000, seed: 7, today }).map((e) => e.email);

    expect(new Set(emails).size).toBe(emails.length);
    for (const email of emails) expect(email).toMatch(/^[a-z0-9]+(\.[a-z0-9]+)*@acme\.test$/);
  });

  it('spreads joining dates over the past 15 years, never after today', () => {
    const dates = generateSeed({ count: 1000, seed: 3, today }).map((e) => e.joiningDate);

    for (const date of dates) {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10)).toBe(date);
      expect(date <= today).toBe(true);
      expect(date >= '2011-06-30').toBe(true);
    }
    expect(new Set(dates.map((d) => d.slice(0, 4))).size).toBeGreaterThanOrEqual(15);
  });

  it('spreads headcount across countries by their weights and uses every role', () => {
    const employees = generateSeed({ count: 5000, seed: 11, today });
    const share = (isoCode: string) => employees.filter((e) => e.countryIsoCode === isoCode).length / employees.length;

    expect(share('IN')).toBeGreaterThan(0.36);
    expect(share('IN')).toBeLessThan(0.44);
    expect(share('US')).toBeGreaterThan(0.21);
    expect(share('US')).toBeLessThan(0.29);
    expect(share('BR')).toBeGreaterThan(0.03);
    expect(share('BR')).toBeLessThan(0.07);
    expect(new Set(employees.map((e) => e.roleName)).size).toBe(15);
  });

  it('varies salaries within a pay group, pays senior roles more, and plants a few outliers', () => {
    const employees = generateSeed({ count: 5000, seed: 5, today });
    const byPayGroup = new Map<string, number[]>();
    for (const e of employees) {
      const key = `${e.countryIsoCode}/${e.roleName}`;
      byPayGroup.set(key, [...(byPayGroup.get(key) ?? []), e.annualCtc]);
    }
    const median = (key: string) => {
      const sorted = [...byPayGroup.get(key)!].sort((a, b) => a - b);
      return sorted[Math.floor(sorted.length / 2)]!;
    };

    for (const e of employees) expect(Number.isInteger(e.annualCtc) && e.annualCtc > 0).toBe(true);
    const usEngineers = byPayGroup.get('US/Software Engineer')!;
    expect(new Set(usEngineers).size).toBeGreaterThan(usEngineers.length / 2);
    expect(median('US/Engineering Manager')).toBeGreaterThan(median('US/Sales Development Representative'));

    const outliers = employees.filter((e) => {
      const m = median(`${e.countryIsoCode}/${e.roleName}`);
      return e.annualCtc > 1.6 * m || e.annualCtc < 0.62 * m;
    });
    expect(outliers.length).toBeGreaterThan(0);
    expect(outliers.length).toBeLessThan(employees.length * 0.03);
  });

  it('uses plain first and last names, without titles or suffixes', () => {
    const names = generateSeed({ count: 2000, seed: 9, today }).map((e) => e.fullName);

    for (const name of names) {
      expect(name).not.toMatch(/^(Mr|Mrs|Ms|Miss|Dr|Prof|Herr|Frau|Sr|Sra)\.?\s/);
      expect(name).not.toMatch(/\s(Jr|Sr|I{2,3}|IV|V|PhD|MD|DDS|DVM)\.?$/);
    }
  });
});
