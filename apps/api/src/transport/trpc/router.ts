import { procedure, router } from './trpc';

export const appRouter = router({
  lookups: router({
    all: procedure.query(({ ctx }) => ctx.lookups.all()),
  }),
});

export type AppRouter = typeof appRouter;
