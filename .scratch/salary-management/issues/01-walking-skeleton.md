# 01: Walking skeleton (lookups end to end)

**What to build:** A thin path through every layer, with nothing functional yet beyond the lookups. HR opens the app, sees the two areas (Employees and Insights), and the Employees area shows the countries (with currency code) and roles (with department) served by the API. This proves the monorepo, the layered API, the database, the web app and both test seams work together before any features are built. Build against the design document (schema §1, layers §2, interfaces §3).

**Blocked by:** None (can start immediately)

**Status:** done

- [x] npm workspaces monorepo with three parts: the API app, the web app, and a shared package (Zod schemas only, no server runtime code)
- [x] API layers set up as designed: transport (tRPC), logic (services, ports), adapter (TypeORM), and a composition root. The domain folder gets its lint rule ("imports nothing") but no code yet; `payStats` arrives test-first in ticket 07
- [x] An ESLint `no-restricted-imports` rule stops logic, domain and transport from importing TypeORM, the driver or the adapter
- [x] Fastify hosts tRPC, serves the built web app, and exposes a health endpoint
- [x] TypeORM on `better-sqlite3`, with an explicit type on every column. Foreign keys are on and checked at startup
- [x] The first committed, reviewed migration creates the **whole schema**:
  - country, department, role, employee and assignment
  - all CHECKs, including the SQLite-specific ones
  - `ux_assignment_current`, `ix_assignment_pay_group`, and a unique email
  - every CHECK and index is also declared on the entities
- [x] `synchronize` is never used. On boot: run migrations, then insert the fixed lists (about 6 countries, 5 departments, 15 roles) if missing
- [x] `lookups.all` goes through the lookup service and the `LookupStore` port to the TypeORM adapter
- [x] React + TypeScript (Vite) + Mantine app with Employees and Insights navigation. It imports only the router's *type*
- [x] Vitest runs in both apps:
  - a test helper builds the app with in-memory SQLite **by running the migrations** and a fixed clock
  - one router test via `createCaller`
  - one page-level React Testing Library test with tRPC mocked
- [x] Schema tests (agreed seam: the migrated schema is an interface, per D-013), one per kind of rule: integer annual CTC > 0, valid ISO dates, lower-case email, non-blank name, at most one current assignment per employee, foreign keys enforced
- [x] One root command runs typecheck, lint and all tests

## Comments

- The domain-error middleware and `errorFormatter` moved to ticket 04. No procedure in this ticket can raise a domain error, so writing them here would be untested, speculative code (TDD rule: only enough code to pass the current test). Ticket 04's duplicate-email and invalid-field tests drive them.
- Schema tests caught a design bug: `date(x) = x` lets non-ISO text through, because `date()` returns NULL and a NULL CHECK passes. Fixed with `date(x) IS x`; the design and decisions docs are updated.
- Dependency versions are pinned to known major lines (TypeORM 0.3, TypeScript 5.9, Vitest 4, Mantine 8, Vite 6, zod 4). `@fastify/static` 10, zod 4 and Vitest 4 were chosen so `npm audit` reports zero vulnerabilities.
