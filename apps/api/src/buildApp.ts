import type { DataSource } from 'typeorm';
import { createLookupStore } from './adapters/typeorm/lookupStore';
import { createLookupService } from './logic/lookupService';
import type { Clock } from './logic/ports';
import { appRouter } from './transport/trpc/router';
import type { Context } from './transport/trpc/trpc';

/** Composition root: the only place that connects adapters to services. */
export function buildApp({ dataSource }: { dataSource: DataSource; clock: Clock }) {
  const context: Context = {
    lookups: createLookupService({ lookups: createLookupStore(dataSource) }),
  };
  return { router: appRouter, createContext: () => context };
}
