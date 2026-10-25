import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1761400000000 implements MigrationInterface {
  name = 'InitialSchema1761400000000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE country (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        name          TEXT NOT NULL UNIQUE,
        iso_code      TEXT NOT NULL UNIQUE,
        currency_code TEXT NOT NULL,
        CONSTRAINT ck_country_iso_code      CHECK (length(iso_code) = 2),
        CONSTRAINT ck_country_currency_code CHECK (length(currency_code) = 3)
      )`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE country`);
  }
}
