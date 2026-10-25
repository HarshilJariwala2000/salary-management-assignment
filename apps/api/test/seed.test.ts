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
});
