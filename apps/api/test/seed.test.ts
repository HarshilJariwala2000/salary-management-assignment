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
});
