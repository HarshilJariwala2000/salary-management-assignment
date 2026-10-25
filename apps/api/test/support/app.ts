import { openDatabase } from '../../src/adapters/typeorm/database';
import { buildApp } from '../../src/buildApp';

/**
 * Builds the real app against a fresh in-memory SQLite database created by
 * running the migrations (never synchronize), with a fixed clock.
 */
export async function makeCaller({ today = '2026-06-30' }: { today?: string } = {}) {
  const dataSource = await openDatabase({ database: ':memory:' });
  const app = buildApp({ dataSource, clock: { today: () => today } });
  return { caller: app.router.createCaller(app.createContext()), dataSource };
}
