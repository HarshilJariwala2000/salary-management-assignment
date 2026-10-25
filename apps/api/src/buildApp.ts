import type { DataSource } from 'typeorm';
import { createEmployeeStore } from './adapters/typeorm/employeeStore';
import { createLookupStore } from './adapters/typeorm/lookupStore';
import { createPayGroupStore } from './adapters/typeorm/payGroupStore';
import { createEmployeeService } from './logic/employeeService';
import { createInsightsService } from './logic/insightsService';
import { createLookupService } from './logic/lookupService';
import type { Clock } from './logic/ports';
import { appRouter } from './transport/trpc/router';
import type { Context } from './transport/trpc/trpc';

/** Composition root: the only place that connects adapters to services. */
export function buildApp({ dataSource, clock }: { dataSource: DataSource; clock: Clock }) {
  const lookups = createLookupStore(dataSource);
  const context: Context = {
    employees: createEmployeeService({ employees: createEmployeeStore(dataSource), lookups, clock }),
    insights: createInsightsService({ payGroups: createPayGroupStore(dataSource), lookups }),
    lookups: createLookupService({ lookups }),
  };
  return { router: appRouter, createContext: () => context };
}
