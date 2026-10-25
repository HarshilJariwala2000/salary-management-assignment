# 01: Walking skeleton (lookups end to end)

**What to build:** A thin path through every layer, with nothing functional yet beyond the lookups. HR opens the app, sees the two areas (Employees and Insights), and the Employees area shows the countries (with currency code) and roles (with department) served by the API. This proves the monorepo, the layered API, the database, the web app and both test seams work together before any features are built. Build against the design document (schema §1, layers §2, interfaces §3).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] npm workspaces monorepo with three parts: the API app, the web app, and a shared package (Zod schemas only, no server runtime code)
- [ ] API layers set up as designed: transport (tRPC), logic (services, ports, domain errors), domain (`payStats` placeholder), adapter (TypeORM), and a composition root
- [ ] An ESLint `no-restricted-imports` rule stops logic, domain and transport from importing TypeORM, the driver or the adapter
- [ ] Fastify hosts tRPC, serves the built web app, and exposes a health endpoint
- [ ] TypeORM on `better-sqlite3`, with an explicit type on every column. Foreign keys are on and checked at startup
- [ ] The first committed, reviewed migration creates the **whole schema**:
  - country, department, role, employee and assignment
  - all CHECKs, including the SQLite-specific ones
  - `ux_assignment_current`, `ix_assignment_pay_group`, and a unique email
  - every CHECK and index is also declared on the entities
- [ ] `synchronize` is never used. On boot: run migrations, then insert the fixed lists (about 6 countries, 5 departments, 15 roles) if missing
- [ ] `lookups.all` goes through the lookup service and the `LookupStore` port to the TypeORM adapter
- [ ] The domain-error middleware and `errorFormatter` (with `data.field`) are in place, even though only lookups exist yet
- [ ] React + TypeScript (Vite) + Mantine app with Employees and Insights navigation. It imports only the router's *type*
- [ ] Vitest runs in both apps:
  - a test helper builds the app with in-memory SQLite **by running the migrations** and a fixed clock
  - one router test via `createCaller`
  - one page-level React Testing Library test with tRPC mocked
- [ ] A migration test proves the database rejects a bad row, e.g. annual CTC 1.5 or an invalid date
- [ ] One root command runs typecheck, lint and all tests
