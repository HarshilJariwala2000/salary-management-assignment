import { employeeInput, employeeListInput } from '@salary/shared';
import { procedure, router } from './trpc';

export const appRouter = router({
  employees: router({
    list: procedure.input(employeeListInput).query(({ ctx, input }) => ctx.employees.list(input)),
    create: procedure.input(employeeInput).mutation(({ ctx, input }) => ctx.employees.create(input)),
  }),
  lookups: router({
    all: procedure.query(({ ctx }) => ctx.lookups.all()),
  }),
});

export type AppRouter = typeof appRouter;
