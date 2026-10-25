import { QueryFailedError } from 'typeorm';
import { DuplicateEmail } from '../../logic/errors';

/**
 * Translates database errors into domain errors. This is the only place that knows SQLite's
 * error codes; a switch to Postgres would match SQLSTATE 23505 on uq_employee_email here.
 * SQLite reports the table and column ("employee.email"), not the constraint name.
 */
export function translateDatabaseError(error: unknown): unknown {
  if (error instanceof QueryFailedError) {
    const driverError = error.driverError as { code?: string; message?: string };
    if (driverError.code === 'SQLITE_CONSTRAINT_UNIQUE' && driverError.message?.includes('employee.email')) {
      return new DuplicateEmail();
    }
  }
  return error;
}
