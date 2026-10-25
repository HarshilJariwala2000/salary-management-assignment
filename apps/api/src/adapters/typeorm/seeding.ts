import type { DataSource } from 'typeorm';
import type { SeedEmployee } from '../../seed/generateSeed';
import { writeEmployees } from './employeeWriter';

/** Seeds only when there are no employees, so restarts never overwrite HR's edits. */
export async function seedIfEmpty(dataSource: DataSource, makeEmployees: () => SeedEmployee[]): Promise<number> {
  const [{ n }] = await dataSource.query('SELECT count(*) AS n FROM employee');
  if (Number(n) > 0) return 0;
  const employees = makeEmployees();
  await writeEmployees(dataSource, employees);
  return employees.length;
}

/** Deletes every employee (assignments cascade) and writes a fresh set. */
export async function reseed(dataSource: DataSource, employees: SeedEmployee[]): Promise<void> {
  await dataSource.query('DELETE FROM employee');
  await writeEmployees(dataSource, employees);
}
