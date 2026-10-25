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
    await q.query(`
      CREATE TABLE department (
        id   INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )`);
    await q.query(`
      CREATE TABLE role (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        name          TEXT NOT NULL UNIQUE,
        department_id INTEGER NOT NULL REFERENCES department (id) ON DELETE RESTRICT
      )`);
    await q.query(`
      CREATE TABLE employee (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name    TEXT NOT NULL,
        email        TEXT NOT NULL,
        joining_date TEXT NOT NULL
      )`);
    await q.query(`
      CREATE TABLE assignment (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id    INTEGER NOT NULL REFERENCES employee (id) ON DELETE CASCADE,
        country_id     INTEGER NOT NULL REFERENCES country (id) ON DELETE RESTRICT,
        role_id        INTEGER NOT NULL REFERENCES role (id) ON DELETE RESTRICT,
        annual_ctc     INTEGER NOT NULL,
        effective_from TEXT NOT NULL,
        effective_to   TEXT,
        CONSTRAINT ck_assignment_annual_ctc CHECK (typeof(annual_ctc) = 'integer' AND annual_ctc > 0)
      )`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE assignment`);
    await q.query(`DROP TABLE employee`);
    await q.query(`DROP TABLE role`);
    await q.query(`DROP TABLE department`);
    await q.query(`DROP TABLE country`);
  }
}
