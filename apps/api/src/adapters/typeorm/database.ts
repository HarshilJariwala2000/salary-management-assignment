import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { CountryEntity } from './entities/CountryEntity';
import { DepartmentEntity } from './entities/DepartmentEntity';
import { RoleEntity } from './entities/RoleEntity';
import { InitialSchema1761400000000 } from './migrations/1761400000000-InitialSchema';
import { ensureReferenceData } from './referenceData';

/**
 * Opens the database, applies pending migrations and inserts the fixed lists.
 * The schema only ever comes from migrations; synchronize is never used (D-013).
 */
export async function openDatabase({ database }: { database: string }): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database,
    entities: [CountryEntity, DepartmentEntity, RoleEntity],
    migrations: [InitialSchema1761400000000],
    synchronize: false,
  });
  await dataSource.initialize();
  await assertForeignKeysOn(dataSource);
  await dataSource.runMigrations();
  await ensureReferenceData(dataSource);
  return dataSource;
}

async function assertForeignKeysOn(dataSource: DataSource): Promise<void> {
  const [row] = await dataSource.query('PRAGMA foreign_keys');
  if (row?.foreign_keys !== 1) throw new Error('SQLite foreign key enforcement is off');
}
