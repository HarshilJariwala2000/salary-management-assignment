import type { LookupStore, Lookups } from './ports';

export function createLookupService({ lookups }: { lookups: LookupStore }) {
  return {
    all(): Promise<Lookups> {
      return lookups.all();
    },
  };
}

export type LookupService = ReturnType<typeof createLookupService>;
