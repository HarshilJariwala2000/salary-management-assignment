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
});
