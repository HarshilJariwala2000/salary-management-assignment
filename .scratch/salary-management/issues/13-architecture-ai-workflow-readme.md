# 13: Architecture, AI workflow and README

**What to build:** The documents a reviewer reads first: what the app is, how to run it, how it's built, and how AI was used to build it.

**Blocked by:** 03, 05, 06, 09, 12

**Status:** ready-for-agent

- [ ] Architecture document:
  - a diagram of the web app, tRPC, Fastify, the modules, `payStats`, TypeORM and SQLite
  - performance notes: the (country, role, annual CTC) index, the size of the stats queries per country, offset pagination at 10k rows, seed timing
- [ ] AI workflow document: the grilling session, the spec, the tickets, which skills and prompts were used, and where AI suggestions were overridden or corrected
- [ ] README: what the app does, the live URL, how to run it (`docker compose up` and local development), how to run tests, and links to requirements, clarifications, decisions, architecture and AI workflow
