import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import Fastify from 'fastify';
import { openDatabase } from './adapters/typeorm/database';
import { seedIfEmpty } from './adapters/typeorm/seeding';
import { buildApp } from './buildApp';
import { SEED, SEED_EMPLOYEES, localToday } from './seed/config';
import { generateSeed } from './seed/generateSeed';

const here = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 3000);
const databasePath = process.env.DATABASE_PATH ?? path.resolve(here, '../salary.db');
const webDist = process.env.WEB_DIST ?? path.resolve(here, '../../web/dist');

const dataSource = await openDatabase({ database: databasePath });
const app = buildApp({ dataSource, clock: { today: localToday } });

const server = Fastify({ logger: true });

const seeded = await seedIfEmpty(dataSource, () =>
  generateSeed({ count: SEED_EMPLOYEES, seed: SEED, today: localToday() }),
);
if (seeded > 0) server.log.info(`Seeded ${seeded} employees`);

await server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: app.router, createContext: app.createContext },
});

server.get('/health', async (_request, reply) => {
  try {
    await dataSource.query('SELECT 1');
    return { status: 'ok' };
  } catch {
    return reply.code(503).send({ status: 'unavailable' });
  }
});

// Serve the built web app, falling back to index.html for client-side navigation.
if (existsSync(webDist)) {
  await server.register(fastifyStatic, { root: webDist });
  server.setNotFoundHandler((request, reply) =>
    request.url.startsWith('/trpc') ? reply.code(404).send() : reply.sendFile('index.html'),
  );
}

await server.listen({ port, host: '0.0.0.0' });
