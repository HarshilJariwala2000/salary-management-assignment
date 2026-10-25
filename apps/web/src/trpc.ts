import { createTRPCContext } from '@trpc/tanstack-react-query';
import type { AppRouter } from '@salary/api';

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();
