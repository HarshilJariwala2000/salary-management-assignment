import { initTRPC } from '@trpc/server';
import type { EmployeeService } from '../../logic/employeeService';
import type { LookupService } from '../../logic/lookupService';

export interface Context {
  employees: EmployeeService;
  lookups: LookupService;
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;
