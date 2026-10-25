import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@salary/api';
import { App } from './App';
import { AppProviders } from './AppProviders';

const queryClient = new QueryClient();
const trpcClient = createTRPCClient<AppRouter>({ links: [httpBatchLink({ url: '/trpc' })] });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders trpcClient={trpcClient} queryClient={queryClient}>
      <App />
    </AppProviders>
  </StrictMode>,
);
