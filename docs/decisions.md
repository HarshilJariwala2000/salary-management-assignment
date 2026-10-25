# Decisions

Each entry records the context, the decision, the alternatives considered, and the consequences. The design they produce is described in [design.md](design.md).

---

## D-001 SQLite on a single volume

- **Context:** one HR user and about 10k employees. The app ships as one Docker image.
- **Decision:** SQLite through `better-sqlite3`, with the database file on a mounted volume.
- **Alternatives:** Postgres (Neon/Supabase). That would mean a second service to provision, configure and keep in step, in exchange for concurrency the product doesn't need.
- **Consequences:**
  - One deployable image, and `docker compose up` gives a working app.
  - Only one process should write at a time.
  - Postgres is the documented path for multiple users (D-012).

## D-002 TypeORM rather than Drizzle

- **Context:** the developer has four years of TypeORM experience.
- **Decision:** TypeORM with decorator entities.
- **Alternatives:** Drizzle (lighter, closer to SQL); Prisma (needs a code-generation step and its own query engine).
- **Consequences:**
  - esbuild-based tools (Vitest, tsx) don't emit decorator metadata, so **every column declares its type explicitly** and nothing relies on type inference.
  - Generated migrations are reviewed rather than trusted (D-013).

## D-003 tRPC rather than REST

- **Context:** the API has one client, our own React app.
- **Decision:** tRPC hosted on Fastify. Zod schemas in a shared package validate on the server and in the forms.
- **Alternatives:** REST with OpenAPI.
- **Consequences:**
  - Types are checked end to end, with no hand-written API client.
  - **There's no public REST API**, so another system (payroll, an HRIS) can't easily call it. The way out is `trpc-to-openapi` or a thin REST layer over the same services.

## D-004 Pay figures always within one country

- **Context:** salaries are stored in local currency.
- **Decision:** every monetary statistic is calculated per pay group (country + role). Salary sorting in the employee list requires a country filter.
- **Alternatives:** convert currencies for org-wide figures. That needs a source of rates and a rule for which date's rate to use.
- **Consequences:** every figure is meaningful. Comparisons across countries are out of scope.

## D-005 No authentication

- **Context:** one persona, and the demo data is fake.
- **Decision:** no login.
- **Alternatives:** a single-user login with demo credentials.
- **Consequences:** reviewers can get straight in. A real deployment needs the org's SSO and role-based access, because salary data is highly sensitive.

## D-006 Top/bottom by x%, not by a fixed number

- **Decision:**
  - x is a whole number from 1 to 50.
  - The count is `max(1, ceil(n × x / 100))`, capped at `floor(n / 2)` so the top and bottom lists never overlap. A group of one is the exception: its single employee is both top and bottom.
  - The cap was added during ticket 09: without it, rounding up makes small groups overlap (3 people at 50% would list 2 at each end, sharing the middle person).
  - Ties are ordered by employee id: the bottom list by salary ascending, the top list by salary descending, with id ascending in both.
- **Alternatives:**
  - A fixed number ("lowest 5"), or a toggle between % and number. **Rejected as scope creep:** a percentage compares fairly across groups of any size, whereas a fixed number needs an overlap cap per group and more rules and tests.
  - Including everyone at the cutoff salary was considered, to handle ties more fairly. Not adopted for the MVP.
- **Consequences:** the results are the same every run. A tie at the cutoff is broken by id.

## D-007 `payStats` is its own test seam

- **Decision:** the pay maths is a pure module tested directly with table-driven tests.
- **Alternatives:** test it only through the router (one seam), so its internals could change freely.
- **Consequences:**
  - The maths edge cases get fast, precise tests.
  - The `payStats` interface becomes a stable contract that changes deliberately.

## D-008 Page size options: 10, 20, 50, 100 (default 20)

- **Decision:** the API accepts only these values.
- **Consequences:** a small, testable set. Changing the page size returns to page 1.

## D-009 Department derived from role

- **Decision:** each role belongs to exactly one department. Department is never stored on employee data.
- **Consequences:** the two can never disagree. Department-level insights can be added later without changing the schema.

## D-010 Schema: the employee is separate from dated assignments

- **Context:** three schemas were designed in parallel:
  - **A, minimal:** 3 tables, department as a text column.
  - **B, flexible:** employee identity plus dated `assignment` rows.
  - **C, read-optimised:** department copied onto the employee, plus covering indexes.
- **Decision:** **B, without its database view and without a currency table.** The current assignment is the row with `effective_to IS NULL`. In the MVP, edits change that row in place, so no history is written.
- **Why:**
  - Salary history becomes a change to one write path (close the current row, insert a new one) rather than a table rewrite.
  - Leavers become "no current assignment".
  - The view wasn't needed at this size. Its job of keeping "current" defined in one place is done by a single adapter helper.
  - A currency table added nothing that `country.currency_code` doesn't already give.
- **Rejected:**
  - **A:** department as free text loses integrity enforced by the database.
  - **C:** it breaks "department is derived" and doubles write cost. Its speed gains are under a millisecond at 10k rows.
- **Consequences:**
  - Every write touches two tables in one transaction.
  - "At least one current assignment" is enforced by the app and covered by a test.
  - The partial indexes only apply to queries that include `effective_to IS NULL`, which the helper guarantees.

## D-011 SQL sorts and filters; the application calculates

- **Decision:**
  - **All sorting and filtering runs in SQL:** list search, filters, sorts, pagination, pay-group selection and top/bottom-k selection.
  - **All calculation runs in pure TypeScript functions (`payStats`):** median, average, spread, histogram, earner count.
- **Why:**
  - The data is small (at most about 4k salaries per country), so moving it into the application costs almost nothing.
  - The calculation logic becomes pure functions, which are easy to test and easy to read.
  - SQLite has no median or percentile functions, and putting that maths in SQL window functions would hurt readability and testability.
  - The database does what it's best at: filtering and ordering through indexes.
- **Consequences:**
  - `payStats` checks that its input is sorted, so a missing `ORDER BY` fails loudly in tests instead of producing a wrong median.
  - Top/bottom selection and tie order are tested through the router.

## D-012 Ports and adapters, ready for a switch to Postgres

- **Context:** the developer requires the database to be separate from the business logic, so the app can move to Postgres. Three layering designs were compared:
  - **A, minimal:** no service layer.
  - **B, ports & adapters.**
  - **C, thin router:** services return the response shape.
- **Decision:** **B**, with A's portability tricks (search via `lower(col) LIKE`, `Number()` on counts). Services depend on **use-case-shaped ports** (`EmployeeStore`, `PayGroupStore`, `LookupStore`, `Clock`). TypeORM lives only in `adapters/typeorm`. An ESLint import rule enforces the boundary.
- **Rejected:**
  - **A:** the business logic would live in tRPC procedures, which doesn't meet the requirement.
  - **C:** services would carry transport concerns (tRPC-style error codes, rounding).
- **Consequences:**
  - A Postgres switch changes only the adapter folder: migrations, entity checks, data-source config and the error classifier.
  - About 150 lines of extra structure, and a few pass-through service methods.
  - **No in-memory fake stores:** sorting and filtering are SQL, so a fake would test the wrong thing.
  - The switch is designed for but **not verified**. Running the suite against real Postgres is out of scope.

## D-013 SQLite-specific CHECKs; tests run the real migrations

- **Decision:**
  - Keep database CHECKs that only work on SQLite (`typeof(annual_ctc) = 'integer'`, `date(x) IS x`), so the database enforces every rule it can. `IS` rather than `=`, because `date()` returns NULL for non-ISO text and a NULL CHECK result passes.
  - Declare them on the entities **and** in the migrations.
  - **Never use `synchronize`.** Tests build each in-memory database by running the migrations.
- **Alternatives:**
  - Portable-only checks, relying on Zod for formats.
  - `synchronize` in tests.
- **Consequences:**
  - What's tested is exactly what ships.
  - A Postgres switch rewrites these checks inside the adapter.
  - Generated migrations must be reviewed.

## D-014 Currency symbol comes from `Intl`

- **Decision:** store only `currency_code`. The UI formats amounts with `Intl.NumberFormat`.
- **Consequences:** one less column, and correct symbols and separators for each locale.

## D-015 `payStats` interface: three functions that work on numbers

- **Context:** three interfaces were compared:
  - **A, minimal:** 2 entry points.
  - **B, flexible:** a `PayGroup` object with percentiles, count selection and configurable buckets.
  - **C, caller-first:** functions named after the screens.
- **Decision:** A's shape with domain names, reduced to work on numbers only after D-011: `analysePayGroup`, `summariseByRole`, `earnerCount`. Programmer errors throw `RangeError`. Figures are unrounded, and rounding happens once, in the tRPC layer.
- **Rejected:**
  - **B:** much of its interface has no caller today, and it includes the fixed-number top/bottom that D-006 scoped out. On a stable test seam, every extra method has to be maintained.
  - **C:** it ties pure maths to the current screens.
- **Consequences:** a small, stable contract with roughly the spec's test matrix and nothing more.

## D-016 Exception to D-011: sorting the Insights overview in the browser

- **Context:** D-011 puts all sorting and filtering in SQL. On the Insights overview, HR sorts the roles table by clicking a column header. Most of those columns (average, median, spread, max ÷ min) are calculated by `payStats`; they don't exist in the database, so SQL cannot sort by them.
- **Decision:** the overview's column sorting happens in the browser, on the rows already on screen. The API returns roles in role-name order.
- **Why this doesn't undermine D-011:**
  - The data is tiny: at most 15 rows per country (one per role), already loaded.
  - It is presentation of calculated results, not selection of data. Which employees are counted and which pay group they belong to is still decided in SQL.
  - The alternative, sorting in TypeScript on the server, would add a sort parameter and a round trip for no gain.
- **Consequences:** the employee list (thousands of rows, paginated) still sorts in SQL. Any future view that sorts calculated figures across many rows should revisit this.
