import { employeeIdInput, employeeInput, employeeListInput, employeeUpdateInput } from '@salary/shared';
import { procedure, router } from './trpc';

export const appRouter = router({
  employees: router({
    list: procedure.input(employeeListInput).query(({ ctx, input }) => ctx.employees.list(input)),
    get: procedure.input(employeeIdInput).query(({ ctx, input }) => ctx.employees.get(input.id)),
    create: procedure.input(employeeInput).mutation(({ ctx, input }) => ctx.employees.create(input)),
    update: procedure
      .input(employeeUpdateInput)
      .mutation(({ ctx, input: { id, ...draft } }) => ctx.employees.update(id, draft)),
  }),
  lookups: router({
    all: procedure.query(({ ctx }) => ctx.lookups.all()),
  }),
});

export type AppRouter = typeof appRouter;
