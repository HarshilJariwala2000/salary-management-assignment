import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase } from './adapters/typeorm/database';
import { reseed } from './adapters/typeorm/seeding';
import { SEED, SEED_EMPLOYEES, localToday } from './seed/config';
import { generateSeed } from './seed/generateSeed';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataSource = await openDatabase({ database: process.env.DATABASE_PATH ?? path.resolve(here, '../salary.db') });
const started = Date.now();
await reseed(dataSource, generateSeed({ count: SEED_EMPLOYEES, seed: SEED, today: localToday() }));
console.log(`Reseeded ${SEED_EMPLOYEES} employees in ${Date.now() - started} ms`);
await dataSource.destroy();
