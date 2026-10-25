# ACME Salary Management

A web app that lets ACME's HR manager keep salary data for 10,000 employees across six countries accurate, and answer "how do we pay people?" in seconds instead of spreadsheet hours.

**Live:** _URL to be added once the Render service is created (ticket 12)_. Hosted on Render's free plan: the first visit after 15 idle minutes takes up to a minute, and edits reset to the seeded data on each restart ([D-017](docs/decisions.md)).

## What HR can do

- **Employees:** search by name or email; filter by country, role and department; sort by name, joining date, or salary within a country. Choose 10, 20, 50 or 100 rows per page. Add, edit and delete employees, with checks that run in the browser and again on the server.
- **Insights:** pick a country to see every role's headcount, min, max, average, median and spread, in that country's currency. Open a role to see its salary distribution with the median marked, and its **top and bottom x% earners** (x from 1 to 50), each shown against the median.

Every pay figure stays within one country, so currencies are never mixed. Department follows from role and currency from country; neither is typed in.

## Run it

**With Docker** (one container, data on a named volume):

```bash
docker compose up --build        # http://localhost:3000
```

**Locally** (Node 22+):

```bash
npm install
npm run dev -w @salary/api       # API on :3000; first start seeds 10,000 employees
npm run dev -w @salary/web       # UI on http://localhost:5173 (calls the API through a proxy)
```

**Production build without Docker:** `npm run build`, then `npm run start -w @salary/api` serves the UI and the API on :3000.

| Setting | Default | Meaning |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `DATABASE_PATH` | `apps/api/salary.db` (`/data/salary.db` in Docker) | SQLite file |
| `SEED_EMPLOYEES` | `10000` | Employees seeded into an empty database |

To wipe and reseed the data: `npm run seed:reset -w @salary/api`.

## Test it

```bash
npm run check                    # typecheck + lint + all tests (126)
```

Tests sit at four agreed seams:
- the pure `payStats` module, with table-driven cases
- the tRPC router, against a real in-memory SQLite database built by running the migrations
- the database schema's own rules
- page-level React Testing Library tests

The history shows them written test-first, in red → green commit pairs.

## How it's built

React + Mantine → tRPC → Fastify → services → `payStats` (pure maths) and TypeORM → SQLite, in an npm workspaces monorepo:

```
apps/api         Fastify + tRPC API: transport/ → logic/ → domain/ (payStats), adapters/typeorm/, seed/
apps/web         React + Vite + Mantine UI
packages/shared  Zod schemas shared by the API and the forms
docs/            requirements, design, decisions, architecture, AI workflow
.scratch/        the spec and tickets (local issue tracker)
```

## Read more

| Document | What's in it |
|---|---|
| [Requirements](docs/requirements.md) | One page: goal, scope, features, and what's left out and why |
| [Clarifications](docs/clarifications.md) | Questions put to the assessment team, and the answers |
| [Architecture](docs/architecture.md) | Diagrams, data model, a request end to end, and **measured performance** |
| [Design](docs/design.md) | Schema, layers, module interfaces, test seams, how a switch to Postgres would work |
| [Decisions](docs/decisions.md) | D-001 to D-017: each choice, the alternatives, and the trade-offs |
| [AI workflow](docs/ai-workflow.md) | How AI was used, where I overrode it, and the mistakes it made |
| [Spec](.scratch/salary-management/spec.md) and [tickets](.scratch/salary-management/issues/) | The user stories, and the slices the build followed |
