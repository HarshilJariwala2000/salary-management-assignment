# 11: Decision records

**What to build:** A single decisions document with one short numbered entry per architectural or product decision. Each entry gives the context, the choice, the alternatives considered, and the consequences. It's for reviewers and interviewers.

**Blocked by:** None (can start immediately)

**Status:** ready-for-human

D-001 to D-015 were written during the design rounds, alongside the design document. What remains is keeping the document current as implementation decisions come up.

- [x] Entries for:
  - SQLite vs Postgres
  - TypeORM vs Drizzle
  - tRPC vs REST
  - pay figures within one country
  - no authentication
  - the top/bottom x% rules
  - `payStats` as its own seam
  - page sizes
  - department derived from role
  - the schema (assignment table)
  - SQL sorts and filters, the app calculates
  - ports and adapters
  - SQLite-specific CHECKs, with tests running migrations
  - currency symbol from `Intl`
  - the `payStats` interface
- [ ] Add an entry for any decision made during implementation that changes or adds to the design
