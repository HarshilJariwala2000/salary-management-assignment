# How I used AI on this project

I built this with **Claude Code** (Claude Opus 5.5) in the terminal, using Matt Pocock's engineering skills for the process. The AI wrote most of the text and code. I made the decisions, and in several places I overrode its recommendation. This page records how the work flowed, where I changed course, and what went wrong.

## The workflow

| Stage | How | What it produced |
|---|---|---|
| 1. Clarify scope | Emailed the assessment team my assumptions before writing anything | [clarifications.md](clarifications.md) |
| 2. Stress-test the plan | `/grill-me` (grilling skill): five rounds of numbered questions, each with a recommended answer that I accepted or changed | A shared understanding of stack, scope and delivery |
| 3. One-page requirements | Drafted by Claude, then revised by me (page sizes; % vs a fixed number of top/bottom earners, judged scope creep) | [requirements.md](requirements.md) |
| 4. Configure the skills | `/setup-matt-pocock-skills`: a local-markdown issue tracker so specs and tickets live in the repo | `.scratch/`, `docs/agents/` |
| 5. Spec | `/to-spec`, after agreeing the test seams | `.scratch/salary-management/spec.md` |
| 6. Tickets | `/to-tickets`: 13 vertical slices with blocking edges, which I corrected | `.scratch/salary-management/issues/` |
| 7. Low-level design | `codebase-design` "design it twice": three rounds (schema, `payStats`, layering). Each ran **three sub-agents in parallel** under opposite constraints (minimal / flexible / caller-first, then ports-and-adapters). I chose in each round | [design.md](design.md), [decisions.md](decisions.md) |
| 8. Build | `/tdd`: seams agreed per ticket, then **red → green commit pairs**, one behaviour at a time | 62 red and 61 green commits across 168 |

## Where I overrode or redirected the AI

| Topic | Claude recommended | I chose | Outcome |
|---|---|---|---|
| API style | Fastify with plain Zod-validated routes | **tRPC** on Fastify | Types are checked end to end, with no hand-written client (D-003) |
| ORM | Drizzle | **TypeORM**, which I've used for four years | Every column declares its type explicitly, because esbuild doesn't emit decorator metadata (D-002) |
| Decision records | An `adr/` folder | Decisions recorded alongside the requirements | Claude pointed out that would break the one-page rule, so we settled on one `decisions.md` |
| CI | GitHub Actions for tests | **No CI** for now | Left out of scope |
| Test seam for the maths | Test `payStats` only through the router | **`payStats` as its own seam** | Fast, precise maths tests, at the cost of a stable interface (D-007) |
| First build step | Start ticketing straight from the spec | **Design the schema and module interfaces first**, with me deciding each round | Three design rounds before any code |
| Schema | Minimal design plus a department table | **Dated `assignment` rows** (history-ready), **without** the view or a currency table | Salary history becomes a code change, not a migration (D-010) |
| Where maths and sorting live | `payStats` sorts its input itself | **All sorting and filtering in SQL; all calculation in pure functions** | Small data, so moving it costs nothing; pure functions are easy to test and read (D-011) |
| Database coupling | No repository interface ("one adapter is a hypothetical seam") | **Keep the database out of the logic layer**, so Postgres is possible | Ports and adapters, enforced by lint (D-012) |
| SQLite-specific checks | Drop them for portability | **Keep them**; a switch can change adapter code | Tests run the real migrations, never `synchronize` (D-013) |
| Ticket blocking | Add employee blocked by the list ticket | **Blocked only by the walking skeleton** | The employee table moved into ticket 01 |
| Top/bottom size rule | Claude found that rounding up made small groups overlap | **Cap at half the group** | All docs fixed before ticket 09 started (D-006) |
| Broken history (below) | Fix forward, or rewrite and force-push | **Fix forward** | An honest record, with a guard added |
| Sorting the Insights table | Flagged as against my "all sorting in SQL" rule | **Allowed, as an exception** | D-016 |

I also accepted Claude's interviewer-view suggestion to keep the original brief and email thread out of the public repo, and to record the clarifications in my own words instead.

## Mistakes, and how they were caught

The test-first loop and some deliberate checks caught most of these before they shipped.

1. **The shared schemas went uncommitted for three tickets.** The script driving each red → green cycle only staged `apps/`, so `packages/shared/src/employees.ts` stayed untracked. My machine always passed; a fresh clone would not. It surfaced when a commit failed. It was fixed forward in one commit that says what happened. Since then, every push is preceded by a fresh-clone `npm run check`.
2. **A broken CHECK in the design.** The design said `date(x) = x`. The red test showed `date()` returns NULL for non-ISO text, and a NULL CHECK result *passes*. Fixed with `date(x) IS x`, and the docs were corrected.
3. **A false promise in the requirements.** "The lists never overlap" wasn't true once counts were rounded up. Caught before ticket 09's first test; the rule and every document were fixed first.
4. **Seed names with titles.** Faker's `fullName()` adds "Ms." and "IV", which leaked into emails. A seed test caught it.
5. **Lopsided rounding.** JavaScript's `Math.round(-0.5)` is `-0`, while `Math.round(0.5)` is `1`. A test with a 100.5 median caught it; money now rounds half away from zero.
6. **Ambiguous currency.** The `en-SG` locale shows Singapore dollars as `$`. Caught by checking real `Intl` output before writing the expected values, rather than guessing.
7. **A production-only crash.** A relative `WEB_DIST` crashed static file serving. Caught by running the production bundle by hand.
8. **A wrong claim about SQLite.** Claude first said duplicate-key errors could be recognised by constraint name. SQLite actually reports `table.column`. Corrected before any code was written.
9. **Dependency versions beyond what the AI knew reliably** (TypeORM 1.x, TypeScript 7). Pinned to known major versions instead. `npm audit` flagged a few of those, so they were moved to their fixed releases (zod 4, Vitest 4, Faker 10, `@fastify/static` 10). Audit reports 0 vulnerabilities.
10. **Script slips.** Nested `describe` blocks and two malformed commit messages. All were fixed or amended before pushing.

## Keeping the AI honest

- **Red is enforced.** The cycle script aborts if a new test passes before any implementation. Tests that passed on their first run are committed separately and labelled as guards, never dressed up as red → green.
- **Expected values come from outside the code.** Statistics are worked out by hand, and currency formats come from real `Intl` output. There are no assertions that recompute the answer the way the code does.
- **Verified, not assumed.** Fresh-clone checks before pushing, timings measured on a 10k database (and one query plan improved because of it), and the production bundle run against production-only dependencies.
- **Unverified things are labelled as such.** The Docker image hasn't been run, and the chart hasn't been viewed in a browser. Both are recorded in the tickets instead of being claimed.

## Example prompts I gave

- `/grill-me @project-brief.md`, then answers like "Q1 Node + TypeScript, rest yes" and "Q5. Can we use trpc?"
- "Shouldn't the 1st step be database schema design and LLD design using … codebase-design?"
- "I would like to be the human in the loop for doing db schema and lld of this. use design it twice skill for it."
- "All of the sorting and filtering should be done in SQL query."
- "Also … keep in mind to decouple db from service or logic layer so we can easily swap to postgres later"
- "I would like to go with option 2" (`payStats` as its own seam)
- "Think as if you are interviewer" (about whether to commit the brief)
- "push and start 04" (each ticket was reviewed before I let it be pushed)
