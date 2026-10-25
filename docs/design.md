# Design: ACME Salary Management

This is the low-level design: the database schema, the modules and their interfaces, and where the seams are. It was produced in three "design it twice" rounds. In each round, three alternative designs were drafted under different constraints, compared, and decided on by the developer. The reasoning behind each choice is in [decisions.md](decisions.md). The product scope is in [requirements.md](requirements.md).

Vocabulary used here:
- **Module**: anything with an interface and an implementation.
- **Interface**: everything a caller must know, including invariants and error modes.
- **Seam**: where an interface lives.
- **Adapter**: something that implements an interface at a seam.
- **Pay group**: the employees who share one country and one role.
- **Current assignment**: an employee's currently active country, role and annual CTC.

---

## 1. Database schema

SQLite through TypeORM, with integer auto-increment primary keys everywhere. Every column is declared with an explicit type (`integer` or `text`), because the esbuild-based tooling (Vitest, tsx) doesn't emit decorator metadata.

```
country     id PK · name TEXT UNIQUE · iso_code TEXT UNIQUE CHECK(length=2)
            · currency_code TEXT CHECK(length=3)
department  id PK · name TEXT UNIQUE
role        id PK · name TEXT UNIQUE · department_id → department (RESTRICT)

employee    id PK
            · full_name    TEXT NOT NULL  CHECK(length(trim(full_name)) > 0)
            · email        TEXT NOT NULL  UNIQUE  CHECK(email = lower(email))
            · joining_date TEXT NOT NULL  CHECK(date(joining_date) IS joining_date)

assignment  id PK
            · employee_id  → employee (CASCADE)
            · country_id   → country  (RESTRICT)
            · role_id      → role     (RESTRICT)
            · annual_ctc     INTEGER NOT NULL CHECK(typeof(annual_ctc) = 'integer' AND annual_ctc > 0)
            · effective_from TEXT NOT NULL    CHECK(date(effective_from) IS effective_from)
            · effective_to   TEXT NULL        -- NULL = the current assignment
              CHECK(effective_to IS NULL OR (date(effective_to) IS effective_to AND effective_to > effective_from))
            · UNIQUE(employee_id, effective_from)

UNIQUE INDEX ux_assignment_current   (employee_id)                                  WHERE effective_to IS NULL
INDEX        ix_assignment_pay_group (country_id, role_id, annual_ctc, employee_id) WHERE effective_to IS NULL
```

**Key points:**
- **Identity is separate from the dated assignment.** An employee's country, role and annual CTC live on `assignment`, so salary history and leavers can be added later without rewriting tables (see D-010).
- **How the MVP uses it:**
  - Each employee has exactly one current assignment (`effective_to IS NULL`).
  - Create inserts the employee and its first assignment in **one transaction**, with `effective_from = joining_date`.
  - Update **edits the current assignment in place**, so no history is written. Changing the joining date keeps `effective_from` in step.
  - Delete is permanent, and the employee's assignments are deleted with it (cascade).
- **"Exactly one current assignment":**
  - *At most one* is enforced by the database through `ux_assignment_current`.
  - *At least one* is enforced by the single write path (the transaction on create), and a router test checks it.
- **Derived values:**
  - Department comes from the role and currency from the country. Neither is ever stored on the employee or assignment.
  - The currency **symbol isn't stored**; the UI formats amounts with `Intl.NumberFormat`.
- **The database enforces every rule it can.** The SQLite-specific CHECKs (`typeof`, `date()`) are deliberate (D-013).
  - Date checks use `date(x) IS x`, not `=`. `date()` returns NULL for non-ISO text, `NULL = x` is NULL, and a CHECK treats NULL as passing. A schema test caught this.
  - Every CHECK and index is declared on the entities (`@Check`, `@Index({ where })`) **and** created by the committed migrations. Keeping the entities complete stops TypeORM's migration generator from proposing to drop checks.
  - `synchronize` is **never** used. Tests build their database by running the migrations (§6).
- `PRAGMA foreign_keys = ON` is checked at startup.
- **Search** uses `lower(e.full_name) LIKE :q OR e.email LIKE :q ESCAPE '\'`, with `:q` the lower-cased term wrapped in `%`. This works the same on SQLite and Postgres. In SQLite, `lower()` and `LIKE` only fold ASCII letters, which is acceptable for the MVP.

## 2. Layers and dependency direction

```
packages/shared            Zod input schemas + inferred types (used by API and React forms)

apps/api/src/
  transport/trpc/          routers · DomainError → TRPCError middleware · rounding
        │
        ▼
  logic/                   services (employees, insights, lookups) · ports · domain errors · domain types
        │            ╲
        ▼             ▼
  domain/payStats          pure maths, imports nothing
  seed/                    pure: fixed lists (countries, departments, roles) + deterministic seed generator
        ▲
  adapters/typeorm/        entities · mappers · current-assignment helper · stores
                           · error classifier · data source · migrations · seed writer
        │ implements logic/ports
  buildApp.ts              composition root: the only file that knows both logic and adapters
  main.ts                  Fastify: hosts tRPC, serves the web build, /health
```

**Import rules, enforced by ESLint `no-restricted-imports`:**
- `domain/` and `seed/` import nothing from the app or infrastructure (`seed/` uses Faker).
- `logic/` may import `domain/` and `packages/shared`, but **never** `typeorm`, `better-sqlite3`, or `adapters/**`.
- `transport/` may import `logic/` and `packages/shared`, but **never** `adapters/**`.
- `adapters/` imports `logic/` (to implement the ports and throw domain errors).
- Only `buildApp.ts` and test helpers import `adapters/`.

## 3. Module interfaces

### 3.1 `domain/payStats` (pure, its own test seam)

```ts
interface PaySummary {
  headcount: number; min: number; max: number;
  average: number; median: number;          // unrounded
  spreadAmount: number; spreadRatio: number; // max − min, max ÷ min
}
interface HistogramBucket { lower: number; upper: number; count: number } // unrounded bounds

analysePayGroup(sortedSalaries: readonly number[]): { summary: PaySummary; histogram: HistogramBucket[] }
summariseByRole(rows: readonly { roleId: number; annualCtc: number }[]): { roleId: number; summary: PaySummary }[]
earnerCount(headcount: number, percent: number): number
```

**Invariants:**
- **Input order:** `analysePayGroup` input is sorted ascending. `summariseByRole` input is sorted by role, then salary; consecutive rows with the same role form one pay group.
- **Sorting is the database's job.** `payStats` **checks** the order in one O(n) pass rather than trusting it.
- **Median:** the middle value for an odd count; the mean of the two middle values for an even count.
- **Histogram:**
  - 10 equal-width buckets from min to max, each `[lower, upper)`, except the last, which is closed (`[lower, upper]`) so max is included.
  - When min = max: a single bucket holding the whole group.
  - Bucket counts always add up to the headcount.
- `earnerCount` = `max(1, ceil(headcount × percent / 100))`, capped at `floor(headcount / 2)` so the two lists never overlap; a group of one gives 1 (the same person is both top and bottom).
- A group of one is valid: spread 0, ratio 1, one bucket.

**Error modes:** these are programmer errors, because Zod and the not-found checks run first. Each throws `RangeError`:
- empty input to `analysePayGroup`
- unsorted input
- a salary that isn't a positive integer
- `percent` that isn't an integer from 1 to 50
- `headcount < 1`

`summariseByRole([])` returns `[]`.

**What it hides:** the median rules, the bucket edge maths (including floating-point clamping, so max always falls in the last bucket), the earner-count rounding, and the grouping of consecutive rows.

### 3.2 Ports: `logic/ports.ts`

The ports are shaped around use cases, not a generic `Repository<T>`, so each adapter method hides a whole query.

```ts
type IsoDate = string;   // 'YYYY-MM-DD'

interface EmployeeView {
  id: number; fullName: string; email: string; joiningDate: IsoDate; annualCtc: number;
  country: { id: number; name: string; currencyCode: string };
  role: { id: number; name: string };
  department: { id: number; name: string };
}
interface EmployeeDraft { fullName: string; email: string; joiningDate: IsoDate; countryId: number; roleId: number; annualCtc: number }
interface Earner { id: number; fullName: string; annualCtc: number; joiningDate: IsoDate }
interface Page<T> { rows: T[]; total: number }

interface EmployeeStore {
  list(q: EmployeeListQuery): Promise<Page<EmployeeView>>; // all filtering/search/sort/pagination in SQL; ORDER BY always ends with employee id
  get(id: number): Promise<EmployeeView | null>;
  create(d: EmployeeDraft): Promise<EmployeeView>;         // one transaction: employee + first assignment; throws DuplicateEmail
  update(id: number, d: EmployeeDraft): Promise<EmployeeView | null>; // current assignment edited in place; throws DuplicateEmail
  delete(id: number): Promise<boolean>;
}
interface PayGroupStore {
  salariesByRole(countryId: number): Promise<{ roleId: number; annualCtc: number }[]>; // ORDER BY role_id, annual_ctc, employee_id
  groupSalaries(countryId: number, roleId: number): Promise<number[]>;                // ORDER BY annual_ctc, employee_id
  earners(countryId: number, roleId: number, k: number): Promise<{ bottom: Earner[]; top: Earner[] }>;
    // bottom: ORDER BY annual_ctc ASC, employee_id ASC LIMIT k
    // top:    ORDER BY annual_ctc DESC, employee_id ASC LIMIT k
}
interface LookupStore {
  all(): Promise<Lookups>;   // countries (with currency code), departments, roles (with department)
  countryExists(id: number): Promise<boolean>;
  roleExists(id: number): Promise<boolean>;
}
interface Clock { today(): IsoDate }
```

**Every** read of current data goes through one private adapter helper, which always applies `effective_to IS NULL`. Nothing else reads `assignment` directly. That condition is also what lets SQLite use the partial indexes.

### 3.3 Domain errors: `logic/errors.ts`

```ts
abstract class DomainError extends Error {}
class NotFound       extends DomainError { entity: 'employee' | 'country' | 'payGroup' }
class InvalidField   extends DomainError { field: 'countryId' | 'roleId' | 'joiningDate'; reason: 'unknown' | 'future' }
class DuplicateEmail extends DomainError { field: 'email' }
```

One tRPC middleware maps them: `NotFound` → `NOT_FOUND`, `InvalidField` → `BAD_REQUEST`, `DuplicateEmail` → `CONFLICT`. The `errorFormatter` copies `field` into `error.data.field`, so the React form shows the message next to the right input. Any other error becomes `INTERNAL_SERVER_ERROR` and is logged.

### 3.4 Services: `logic/`

```ts
createEmployeeService({ employees, lookups, clock }) → {
  list(q): Promise<Page<EmployeeView>>,
  get(id): Promise<EmployeeView>,                 // NotFound
  create(d): Promise<EmployeeView>,               // InvalidField(joiningDate, future | countryId, unknown | roleId, unknown), DuplicateEmail
  update(id, d): Promise<EmployeeView>,           // same as create, plus NotFound
  delete(id): Promise<void>,                      // NotFound
}
createInsightsService({ payGroups, lookups }) → {
  countryOverview(countryId): Promise<{ role, department, summary }[]>,   // NotFound(country); unrounded
  roleDetail(countryId, roleId, percent): Promise<{ summary, histogram, bottom, top }>, // NotFound(payGroup); unrounded
}
createLookupService({ lookups }) → { all(): Promise<Lookups> }
```

- **Employee service:** checks the business rules **before** any write.
  - The joining date must not be after `clock.today()`.
  - The country and role must exist. They're checked against `LookupStore`, because SQLite's foreign-key errors don't say which column failed.

  Email is trimmed and lower-cased by the shared Zod schema, and the database CHECK backs that up.
- **Insights `roleDetail`:**
  1. `groupSalaries`; an empty result throws `NotFound`.
  2. `analysePayGroup`.
  3. `k = earnerCount(n, percent)`.
  4. `earners(k)`.
  5. Each earner gets `differenceFromMedian = annualCtc − median`.
- **Insights `countryOverview`:** `salariesByRole`, then `summariseByRole`. Role and department names are filled in from the lookups.
- `list`, `get`, `delete` and `lookups.all` are thin pass-throughs. That's accepted, so the transport layer never touches ports.

### 3.5 Transport: `transport/trpc/`

Each procedure does three things:
1. Parse input with the shared Zod schema. Zod enforces:
   - page size ∈ {10, 20, 50, 100}
   - salary sort requires a country
   - percent is an integer from 1 to 50
   - field formats
2. Call one service method.
3. **Round** monetary figures to whole currency units:
   - average and median
   - histogram bounds
   - difference from median
   - spread ratio, to 2 decimal places

Rounding happens here and nowhere else.

### 3.6 Adapters: `adapters/typeorm/`

- **Entities:** private to the adapter. Mappers turn query rows into `EmployeeView`, `Earner` and so on.
- **Current-assignment helper:** the single place where `effective_to IS NULL` is applied.
- **Stores:** implement the three store ports with the TypeORM QueryBuilder.
  - Counts are converted with `Number()`, because Postgres returns `COUNT` as a string.
  - Search escapes `%` and `_` in the user's term.
- **Error classifier:** one function that turns a driver error into `DuplicateEmail` or rethrows it. For SQLite it matches `SQLITE_CONSTRAINT_UNIQUE` on `employee.email`. SQLite reports the table and column, not the constraint name.
- **Data source:** opens the database, enables foreign keys, and runs pending migrations.
- **Seed writer:** writes rows produced by the pure seed generator in one transaction (§5).

## 4. Request flows

**Create employee:**

```
React form ─(Zod)→ employees.create ─(Zod)→ EmployeeService.create
   → future date?   → InvalidField(joiningDate)
   → country/role?  → InvalidField(countryId|roleId)
   → EmployeeStore.create  [txn: INSERT employee; INSERT assignment(effective_from = joining_date)]
        UNIQUE violation → classifier → DuplicateEmail
   ← EmployeeView ← middleware maps any DomainError → TRPCError{ code, data.field }
```

**Role detail:**

```
insights.roleDetail ─(Zod)→ InsightsService.roleDetail
   → PayGroupStore.groupSalaries   (SQL: current assignments, sorted)    [] → NotFound(payGroup)
   → payStats.analysePayGroup      (summary + histogram, checks order)
   → payStats.earnerCount          (k)
   → PayGroupStore.earners(k)      (SQL: bottom k / top k, tie-break by id)
   → differenceFromMedian per earner
   ← router rounds → response
```

## 5. Seed

- **A pure generator** (`generateSeed({ count, seed })`) produces lookups, employees and their first assignments deterministically. It uses a fixed-seed random-number generator and Faker, has no I/O, and is tested directly.
  - Country mix: India ~40%, US ~25%, UK ~12%, Germany ~10%, Singapore ~8%, Brazil ~5%.
  - About 15 roles across about 5 departments.
  - Salary = role base pay × country factor × log-normal noise, with a few planted outliers.
  - Unique emails, and joining dates over the past ~15 years.
- **The adapter's seed writer** inserts everything in one transaction.
- **On boot:** run migrations, then insert lookups if they're missing, then seed employees only if there are none. A manual reset command wipes and reseeds.

## 6. Testing

| Seam | How | What it covers |
|---|---|---|
| `domain/payStats` | direct, table-driven Vitest | summary, median for odd and even counts, spread, a group of one, histogram edges (max in the last bucket, min = max), `earnerCount` rounding and cap (5% of 7 → 1; 10% of 25 → 3; 50% of 3 → 1; x = 1 and 50; a group of one), grouping, every `RangeError` including unsorted input |
| tRPC router | `appRouter.createCaller(buildApp({ dataSource, clock: fixed }))` against **in-memory SQLite built by running the migrations** | employee CRUD, Zod and domain errors with `field`, duplicate email (including on update), list search, filters, sorts, page sizes and count; insights wiring: correct pay group, no mixing of countries, NotFound cases, **top/bottom tie order and difference from median**, rounding; a newly created employee appears in both the list and the insights |
| React pages | React Testing Library, tRPC mocked | field errors, derived department and currency, salary sort disabled until a country is chosen, page-size selector, x% input range, delete confirmation text |
| Seed generator | direct | identical output on repeat runs, unique emails, no future dates |

- **No in-memory fake stores.** All sorting and filtering is SQL by design, so a fake would re-implement it in TypeScript and test the wrong thing. The only test double is the fixed `Clock`.
- **Never `synchronize`.** Tests run the same migrations as production, so the SQLite-specific CHECKs are tested too, and the migrations are proven to work.

## 7. Performance

At about 10k employees, the database is under 5 MB and stays in memory.

- **Country overview and role detail:** served by the partial `ix_assignment_pay_group` index. The rows come back already in pay-group order, so there's no sort step. At most about 4k rows for the largest country.
- **Earners:** two `LIMIT k` reads on the same index.
- **Employee list:**
  - Substring search can't use a B-tree index, so it scans about 10k rows (a few ms).
  - Sorting by name or joining date uses a temporary sort.
  - The total count is a separate query with the same `WHERE`.

  Each list request takes a few milliseconds, which is less than the HTTP overhead. No extra indexes were added (D-010 explains why the read-optimised schema was rejected).
- **Offset pagination** is fine at this size. Past about 1M rows, keyset pagination would be the next step.
- **Seeding** 10k employees plus assignments takes about a second in one transaction.

## 8. Switching to Postgres

**What changes, all inside `adapters/typeorm/`:**
1. A Postgres migration set, with native `integer` and `date` types replacing the `typeof()`/`date()` checks.
2. Entity `@Check` expressions, updated to match.
3. The data-source config (driver and connection).
4. The error classifier: SQLSTATE `23505` plus the constraint `uq_employee_email`.

**Unchanged:** services, ports, `payStats`, the tRPC transport, the shared schemas and the web app. The lint import rules guarantee this.

**Known differences in behaviour to check when switching:**
- Name sort order: SQLite sorts by raw bytes; Postgres uses locale collation.
- Unicode `lower()`: SQLite only lowercases ASCII.
- `COUNT` returned as a string: already handled with `Number()`.
- `bigint` values returned as strings, if CTC ever needs them.

Running the router test suite against a real Postgres database (e.g. Testcontainers) is **out of scope**. The switch is designed for but not yet verified.
