# 01: Walking skeleton (lookups end to end)

**What to build:** A thin path through every layer, with nothing functional yet beyond the lookups. HR opens the app, sees the two areas (Employees and Insights), and the Employees area shows the countries (with currency) and roles (with department) served by the API. This proves the monorepo, API, database, web app and both test seams work together before any features are built.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] npm workspaces monorepo with three parts: the API app, the web app, and a shared package (Zod schemas only, no server runtime code)
- [ ] Fastify hosts tRPC (via the Fastify adapter) and a health endpoint, and serves the built web app as static files
- [ ] TypeORM on `better-sqlite3`. Every column has its type written out; nothing relies on decorator metadata
- [ ] First committed migration creates the country, department, role and **employee** tables, with:
  - each role belonging to exactly one department
  - email unique ignoring case
  - an index on (country, role, annual CTC)
- [ ] The fixed lists (about 6 countries with currency, about 5 departments, about 15 roles) are inserted on boot when missing
- [ ] `lookups.all` returns countries (with currency), departments, and roles (with department)
- [ ] React + TypeScript (Vite) + Mantine app with Employees and Insights navigation. The web app imports only the router's *type* from the API
- [ ] Vitest runs in both apps:
  - one router test via `createCaller` against in-memory SQLite (`synchronize` only in tests)
  - one page-level React Testing Library test with tRPC mocked
- [ ] One root command runs typecheck, lint and all tests
