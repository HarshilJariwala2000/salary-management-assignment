# 11: Decision records

**What to build:** A single decisions document with one short numbered entry per architectural or product decision. Each entry gives the context, the choice, the alternatives considered, and the consequences. It's for reviewers and interviewers.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Entries for:
  - SQLite vs Postgres
  - TypeORM vs Drizzle, including the esbuild decorator-metadata problem and the explicit-column-types fix
  - tRPC vs REST: no public REST API; `trpc-to-openapi` as the way out
  - pay figures always within one country
  - no authentication
  - the top/bottom x% rules, and fixed-number top/bottom left out
  - `payStats` as its own test seam
  - page-size options 10/20/50/100
  - department derived from role
- [ ] Entries are numbered `D-001`, `D-002`, … so other documents can refer to them
