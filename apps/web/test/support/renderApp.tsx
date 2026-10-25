import { render } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, TRPCClientError, type TRPCLink } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import type { AppRouter } from '@salary/api';
import { App } from '../../src/App';
import { AppProviders } from '../../src/AppProviders';

/** Canned responses keyed by procedure path, e.g. { 'lookups.all': {...} }. */
export type ApiResponses = Record<string, unknown>;

/**
 * Terminating tRPC link that answers from canned responses instead of the network,
 * so pages run their real hooks and providers against a fake API boundary.
 */
function cannedLink(responses: ApiResponses): TRPCLink<AppRouter> {
  return () =>
    ({ op }) =>
      observable((observer) => {
        if (!(op.path in responses)) {
          observer.error(TRPCClientError.from(new Error(`No canned response for ${op.path}`)));
          return;
        }
        observer.next({ result: { type: 'data', data: responses[op.path] } });
        observer.complete();
      });
}

export function renderApp(responses: ApiResponses) {
  const trpcClient = createTRPCClient<AppRouter>({ links: [cannedLink(responses)] });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <AppProviders trpcClient={trpcClient} queryClient={queryClient}>
      <App />
    </AppProviders>,
  );
}
