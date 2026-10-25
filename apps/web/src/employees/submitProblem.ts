import { TRPCClientError } from '@trpc/client';
import type { SubmitProblem } from './EmployeeForm';

/** A domain error names its field (set by the API's errorFormatter); anything else is a general failure. */
export function toSubmitProblem(error: unknown): SubmitProblem {
  if (error instanceof TRPCClientError) {
    const field = (error.data as { field?: string } | undefined)?.field;
    return { field, message: error.message };
  }
  return { message: 'Something went wrong' };
}
