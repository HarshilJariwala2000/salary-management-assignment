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
        joining_date TEXT NOT NULL,
        CONSTRAINT uq_employee_email        UNIQUE (email),
        CONSTRAINT ck_employee_full_name    CHECK (length(trim(full_name)) > 0),
        CONSTRAINT ck_employee_email        CHECK (email = lower(email)),
        CONSTRAINT ck_employee_joining_date CHECK (date(joining_date) IS joining_date)
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
        CONSTRAINT uq_assignment_employee_start UNIQUE (employee_id, effective_from),
        CONSTRAINT ck_assignment_annual_ctc     CHECK (typeof(annual_ctc) = 'integer' AND annual_ctc > 0),
        CONSTRAINT ck_assignment_effective_from CHECK (date(effective_from) IS effective_from),
        CONSTRAINT ck_assignment_effective_to   CHECK (
          effective_to IS NULL OR (date(effective_to) IS effective_to AND effective_to > effective_from)
        )
      )`);
    // At most one current assignment per employee (D-010).
    await q.query(`CREATE UNIQUE INDEX ux_assignment_current ON assignment (employee_id) WHERE effective_to IS NULL`);
    // Serves pay-group reads in (role, salary, id) order without a sort step. Only used by
    // queries that include effective_to IS NULL, which the current-assignment helper guarantees.
    await q.query(`
      CREATE INDEX ix_assignment_pay_group ON assignment (country_id, role_id, annual_ctc, employee_id)
      WHERE effective_to IS NULL`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX ix_assignment_pay_group`);
    await q.query(`DROP INDEX ux_assignment_current`);
    await q.query(`DROP TABLE assignment`);
    await q.query(`DROP TABLE employee`);
    await q.query(`DROP TABLE role`);
    await q.query(`DROP TABLE department`);
    await q.query(`DROP TABLE country`);
  }
}
