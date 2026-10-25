import { render } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, TRPCClientError, type TRPCLink } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import type { AppRouter } from '@salary/api';
import { App } from '../../src/App';
import { AppProviders } from '../../src/AppProviders';

/**
 * Canned responses keyed by procedure path, e.g. { 'lookups.all': {...} }.
 * A function receives the call's input, for responses that depend on it, and may return a Promise.
 */
export type ApiResponses = Record<string, unknown>;

export interface ApiCall {
  path: string;
  input: unknown;
}

/**
 * Terminating tRPC link that answers from canned responses instead of the network,
 * so pages run their real hooks and providers against a fake API boundary.
 */
function cannedLink(responses: ApiResponses, calls: ApiCall[]): TRPCLink<AppRouter> {
  return () =>
    ({ op }) =>
      observable((observer) => {
        calls.push({ path: op.path, input: op.input });
        if (!(op.path in responses)) {
          observer.error(TRPCClientError.from(new Error(`No canned response for ${op.path}`)));
          return;
        }
        const response = responses[op.path];
        const answer = (data: unknown) => {
          observer.next({ result: { type: 'data', data } });
          observer.complete();
        };
        const fail = (error: unknown) =>
          observer.error(error instanceof TRPCClientError ? error : TRPCClientError.from(error as Error));
        try {
          const data = typeof response === 'function' ? response(op.input) : response;
          // A Promise answers later, like a slow network, so a test can see what renders meanwhile.
          if (data instanceof Promise) data.then(answer, fail);
          else answer(data);
        } catch (error) {
          fail(error);
        }
      });
}

const httpStatus = { BAD_REQUEST: 400, NOT_FOUND: 404, CONFLICT: 409, INTERNAL_SERVER_ERROR: 500 } as const;

/**
 * A canned response that fails the way the real API does: same error shape,
 * including the `field` our errorFormatter adds for domain errors.
 */
export function apiError(code: keyof typeof httpStatus, message: string, field?: string) {
  return () => {
    throw TRPCClientError.from({
      error: { message, code: -32000, data: { code, httpStatus: httpStatus[code], path: '', field } },
    });
  };
}

export function renderApp(responses: ApiResponses) {
  const calls: ApiCall[] = [];
  const trpcClient = createTRPCClient<AppRouter>({ links: [cannedLink(responses, calls)] });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(
    <AppProviders trpcClient={trpcClient} queryClient={queryClient}>
      <App />
    </AppProviders>,
  );
  return { ...view, calls };
}
