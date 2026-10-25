import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TRPCClientError } from '@trpc/client';
import type { EmployeeDraft } from '@salary/shared';
import { useTRPC } from '../trpc';
import type { SubmitProblem } from './EmployeeForm';

/**
 * Every employee write: save, confirm, refresh what the write made stale, and report a problem
 * instead of throwing. Cached Insights figures are dropped rather than marked stale, so the next
 * visit waits for fresh figures instead of showing old ones first.
 */
export function useEmployeeWrites() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const create = useMutation(trpc.employees.create.mutationOptions());
  const update = useMutation(trpc.employees.update.mutationOptions());
  const remove = useMutation(trpc.employees.delete.mutationOptions());

  async function write<T>(save: () => Promise<T>, confirmation: (saved: T) => string): Promise<SubmitProblem | void> {
    let saved: T;
    try {
      saved = await save();
    } catch (error) {
      return toSubmitProblem(error);
    }
    notifications.show({ color: 'green', message: confirmation(saved) });
    queryClient.removeQueries({ queryKey: trpc.insights.pathKey() });
    // Not awaited: the caller can close while the list refreshes.
    void queryClient.invalidateQueries({ queryKey: trpc.employees.pathKey() });
  }

  return {
    create: (draft: EmployeeDraft) => write(() => create.mutateAsync(draft), (e) => `${e.fullName} added`),
    update: (id: number, draft: EmployeeDraft) =>
      write(() => update.mutateAsync({ id, ...draft }), (e) => `${e.fullName} updated`),
    remove: (employee: { id: number; fullName: string }) =>
      write(() => remove.mutateAsync({ id: employee.id }), () => `${employee.fullName} deleted`),
    creating: create.isPending,
    updating: update.isPending,
    removing: remove.isPending,
  };
}

/** A domain error names its field (set by the API's errorFormatter); anything else is a general failure. */
function toSubmitProblem(error: unknown): SubmitProblem {
  if (error instanceof TRPCClientError) {
    const field = (error.data as { field?: string } | undefined)?.field;
    return { field, message: error.message };
  }
  return { message: 'Something went wrong' };
}
