import type { ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import type { TRPCClient } from '@trpc/client';
import type { AppRouter } from '@salary/api';
import { TRPCProvider } from './trpc';

export function AppProviders({
  trpcClient,
  queryClient,
  children,
}: {
  trpcClient: TRPCClient<AppRouter>;
  queryClient: QueryClient;
  children: ReactNode;
}) {
  return (
    <MantineProvider>
      <Notifications />
      <QueryClientProvider client={queryClient}>
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          {children}
        </TRPCProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
