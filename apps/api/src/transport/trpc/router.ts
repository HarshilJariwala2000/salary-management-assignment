import {
  countryOverviewInput,
  roleDetailInput,
  employeeIdInput,
  employeeInput,
  employeeListInput,
  employeeUpdateInput,
} from '@salary/shared';
import { roundHistogram, roundMoney, roundSummary } from './rounding';
import { procedure, router } from './trpc';

export const appRouter = router({
  employees: router({
    list: procedure.input(employeeListInput).query(({ ctx, input }) => ctx.employees.list(input)),
    get: procedure.input(employeeIdInput).query(({ ctx, input }) => ctx.employees.get(input.id)),
    create: procedure.input(employeeInput).mutation(({ ctx, input }) => ctx.employees.create(input)),
    delete: procedure.input(employeeIdInput).mutation(async ({ ctx, input }) => {
      await ctx.employees.delete(input.id);
      return { id: input.id };
    }),
    update: procedure
      .input(employeeUpdateInput)
      .mutation(({ ctx, input: { id, ...draft } }) => ctx.employees.update(id, draft)),
  }),
  insights: router({
    countryOverview: procedure.input(countryOverviewInput).query(async ({ ctx, input }) => {
      const { country, roles } = await ctx.insights.countryOverview(input.countryId);
      return { country, roles: roles.map((r) => ({ ...r, summary: roundSummary(r.summary) })) };
    }),
    roleDetail: procedure.input(roleDetailInput).query(async ({ ctx, input }) => {
      const detail = await ctx.insights.roleDetail(input.countryId, input.roleId, input.percent);
      const roundEarner = <E extends { differenceFromMedian: number }>(e: E) => ({
        ...e,
        differenceFromMedian: roundMoney(e.differenceFromMedian),
      });
      return {
        ...detail,
        summary: roundSummary(detail.summary),
        histogram: roundHistogram(detail.histogram),
        bottom: detail.bottom.map(roundEarner),
        top: detail.top.map(roundEarner),
      };
    }),
  }),
  lookups: router({
    all: procedure.query(({ ctx }) => ctx.lookups.all()),
  }),
});

export type AppRouter = typeof appRouter;
