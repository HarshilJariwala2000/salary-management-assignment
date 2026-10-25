# 13: Architecture, AI workflow and README

**What to build:** The documents a reviewer reads first: what the app is, how to run it, how it's built, and how AI was used to build it.

**Blocked by:** 03, 05, 06, 09, 12

**Status:** ready-for-human

- [x] Architecture document:
  - a diagram of the web app, tRPC, Fastify, the modules, `payStats`, TypeORM and SQLite
  - performance notes: the (country, role, annual CTC) index, the size of the stats queries per country, offset pagination at 10k rows, seed timing
- [x] AI workflow document: the grilling session, the spec, the tickets, which skills and prompts were used, and where AI suggestions were overridden or corrected
- [ ] README: what the app does, the live URL, how to run it (`docker compose up` and local development), how to run tests, and links to requirements, clarifications, decisions, architecture and AI workflow

## Comments

- Performance figures were measured, not estimated: the full router stack against a seeded 10k database, median of 50 runs (`docs/architecture.md`). The measurement showed a temporary B-tree in the overview's query plan; ordering the tie-break by the indexed `a.employee_id` removed it (1.6 → 1.2 ms).
- `docs/ai-workflow.md` is written in the developer's voice from this session's record, for the developer to review and edit.
- Still for a human:
  - [ ] README: add the live URL once ticket 12 deploys
  - [ ] Look at the role-detail chart in a real browser (never seen rendered; jsdom can't lay out Recharts)
  - [ ] Review `docs/ai-workflow.md` and edit it to match your own account
