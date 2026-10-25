import { initTRPC } from '@trpc/server';
import type { LookupService } from '../../logic/lookupService';

export interface Context {
  lookups: LookupService;
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;
