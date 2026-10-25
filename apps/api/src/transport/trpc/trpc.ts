import { initTRPC, TRPCError } from '@trpc/server';
import type { EmployeeService } from '../../logic/employeeService';
import { DomainError } from '../../logic/errors';
import type { LookupService } from '../../logic/lookupService';

export interface Context {
  employees: EmployeeService;
  lookups: LookupService;
}

const t = initTRPC.context<Context>().create({
  // Passes a domain error's field to the client, so forms can show it next to the right input.
  errorFormatter({ shape, error }) {
    const field = error.cause instanceof DomainError ? error.cause.field : undefined;
    return { ...shape, data: { ...shape.data, field } };
  },
});

const trpcCodes = {
  NOT_FOUND: 'NOT_FOUND',
  INVALID_FIELD: 'BAD_REQUEST',
  CONFLICT: 'CONFLICT',
} as const satisfies Record<DomainError['kind'], TRPCError['code']>;

/** Maps domain errors to tRPC codes; anything else stays INTERNAL_SERVER_ERROR. */
const mapDomainErrors = t.middleware(async ({ next }) => {
  const result = await next();
  if (!result.ok && result.error.cause instanceof DomainError) {
    const cause = result.error.cause;
    throw new TRPCError({ code: trpcCodes[cause.kind], message: cause.message, cause });
  }
  return result;
});

export const router = t.router;
export const procedure = t.procedure.use(mapDomainErrors);
