# Spec: ACME Salary Management (MVP)

Status: ready-for-agent

## Problem Statement

ACME's HR manager looks after salary data for about 10,000 employees across several countries, and all of it lives in Excel files. Keeping those spreadsheets up to date is slow and error-prone. Basic questions about how the org pays people are hard to answer: "what's the median pay for a Software Engineer in India?", "how wide is the pay spread for this role?", "who are the lowest-paid 10% in this role?". Each one means filtering, sorting and writing formulas by hand, separately for every country, because each country pays in its own currency.

## Solution

A web application for the HR manager with two areas:

1. **Employees.** A searchable, filterable, paginated list of all employees, where HR can add, edit and delete employees. Each employee has one current annual CTC in their country's local currency. Department and currency are never typed in: department comes from the job role and currency comes from the country.
2. **Insights.** HR picks a country and sees one row per job role: headcount, min, max, average, median and spread. Choosing a role opens a detail view with a salary histogram (median marked), and the top and bottom x% of earners for any x from 1 to 50.

All pay figures are always within one country, so currencies are never mixed. The app ships as one Docker image. It contains the API and the UI, keeps its SQLite database on a mounted volume, and seeds 10,000 realistic, reproducible employees the first time it starts.

## User Stories

### Employee list

1. As an HR manager, I want to see a list of all employees, so that I no longer need to open spreadsheets to find someone.
2. As an HR manager, I want to choose whether each page shows 10, 20, 50 or 100 employees (20 by default), so that I can switch between a quick glance and scanning many rows, and the list stays fast with 10,000 employees.
3. As an HR manager, I want to see the total number of matching employees, so that I know how big the current selection is.
4. As an HR manager, I want each row to show name, email, country, job role, department, joining date and annual CTC with its currency, so that I can see an employee's key facts at a glance.
5. As an HR manager, I want to search by name or email, so that I can find a specific employee quickly.
6. As an HR manager, I want search to ignore upper and lower case, so that "priya" finds "Priya".
7. As an HR manager, I want to filter by country, so that I can work on one country's workforce.
8. As an HR manager, I want to filter by job role, so that I can see everyone in a given role.
9. As an HR manager, I want to filter by department, so that I can see a whole function's employees.
10. As an HR manager, I want to combine search and filters, so that I can narrow down to exactly the group I care about.
11. As an HR manager, I want to sort by name, so that I can scan the list alphabetically.
12. As an HR manager, I want to sort by joining date, so that I can see the newest or longest-serving employees.
13. As an HR manager, I want to sort by salary once I've selected a country, so that I can rank pay within that country.
14. As an HR manager, I want salary sorting unavailable until a country is selected, with a short explanation, so that I'm never shown a meaningless ranking that mixes ₹ and $.
15. As an HR manager, I want to switch between ascending and descending sort, so that I can look at either end of the list.
16. As an HR manager, I want changing a filter, the search or the page size to send me back to page 1, so that I never land on an empty page that no longer exists.
17. As an HR manager, I want a clear empty state when nothing matches, so that I know the search worked and found nothing.

### Adding, editing and deleting employees

18. As an HR manager, I want to add a new employee from a form, so that new hires are recorded straight away.
19. As an HR manager, I want the add/edit form to open in a side drawer over the list, so that I keep my filters and position when I'm done.
20. As an HR manager, I want to pick country and job role from dropdowns, so that I can't type a misspelled value that splits the insights.
21. As an HR manager, I want the form to show the department once I pick a role, so that I can see where the employee belongs without entering it.
22. As an HR manager, I want the form to show the currency once I pick a country, so that I know which currency the salary I'm entering is in.
23. As an HR manager, I want to be told when a name is blank, so that every record names a person.
24. As an HR manager, I want to be told when an email is invalid, so that contact details stay usable.
25. As an HR manager, I want to be told when an email is already used by another employee, so that every employee has a unique email.
26. As an HR manager, I want to be told when the salary isn't a positive whole number, so that mistyped salaries don't skew the insights.
27. As an HR manager, I want to be told when the joining date is in the future, so that the data reflects actual employees.
28. As an HR manager, I want validation messages next to the field they belong to, as I fill the form, so that I can fix mistakes before submitting.
29. As an HR manager, I want the server to apply the same rules even if the browser check is bypassed, so that bad data never reaches the database.
30. As an HR manager, I want to edit an existing employee's details and salary, so that the record stays current after a raise or role change.
31. As an HR manager, I want the edit form to open with the employee's current values, so that I only change what I need.
32. As an HR manager, I want the list to show my change straight after saving, so that I can trust it was saved.
33. As an HR manager, I want a confirmation message after a successful add, edit or delete, so that I know the action worked.
34. As an HR manager, I want to delete an employee from their row, so that people who have left are removed.
35. As an HR manager, I want the delete confirmation to name the employee, so that I don't delete the wrong person.
36. As an HR manager, I want a clear error message if saving fails, so that I know my change wasn't stored and can retry.

### Insights: country overview

37. As an HR manager, I want to pick a country on the Insights page, so that I can see how that country pays people.
38. As an HR manager, I want a table with one row per job role in that country, so that I can compare roles side by side.
39. As an HR manager, I want each row to show headcount, so that I know how many people each figure is based on.
40. As an HR manager, I want each row to show min and max salary, so that I can see each role's pay range.
41. As an HR manager, I want each row to show average and median salary, so that I see typical pay, with the median not skewed by a few very high or very low salaries.
42. As an HR manager, I want each row to show the spread, both max − min and max ÷ min, so that I can spot roles with unusually wide pay.
43. As an HR manager, I want every amount shown in the country's currency, with its symbol and thousands separators, so that the figures are easy to read.
44. As an HR manager, I want to sort the roles table by any column, so that I can find the best-paid role or the widest spread.
45. As an HR manager, I want roles with no employees in that country left out of the table, so that the table isn't cluttered with empty rows.
46. As an HR manager, I want each role row to show its department, so that I can read the table by function.

### Insights: role detail

47. As an HR manager, I want to click a role in the overview to open its detail view, so that I can go deeper into one pay group.
48. As an HR manager, I want the detail view to repeat the group's headcount, min, max, average, median and spread, so that I have the context while looking at individuals.
49. As an HR manager, I want a histogram of salaries in the group, so that I can see whether pay is clustered, skewed or split into two clusters.
50. As an HR manager, I want the median marked on the histogram, so that I can see where the middle sits in the distribution.
51. As an HR manager, I want to enter a percentage x from 1 to 50, so that I can choose how many top and bottom earners to see.
52. As an HR manager, I want to see the top x% earners in the group, so that I can review the highest-paid people in the role.
53. As an HR manager, I want to see the bottom x% earners in the group, so that I can spot people who may be underpaid.
54. As an HR manager, I want at least one person in each list, even when x% of a small group is less than one, so that the feature works for small teams.
55. As an HR manager, I want each listed earner to show name, salary, difference from the median and joining date, so that I can judge whether their position is justified, e.g. a recent joiner.
56. As an HR manager, I want the same people listed every time for the same inputs, even when salaries are tied, so that I can rely on and share what I see.
57. As an HR manager, I want values of x outside 1–50 rejected with an explanation, so that the top and bottom lists never overlap or come back empty.
58. As an HR manager, I want an easy way back from a role to its country overview, so that I can move between roles quickly.

### Navigation, data and running the app

59. As an HR manager, I want two clearly labelled areas, Employees and Insights, so that I always know where to go.
60. As an HR manager, I want the app to open already filled with realistic data, so that I can explore it straight away.
61. As an HR manager, I want my edits to survive an app restart, so that I never lose work.
62. As a reviewer, I want to start the whole app with one command (`docker compose up`), so that I can evaluate it without setting anything up.
63. As a reviewer, I want the seed data to be identical on every run, so that demos, screenshots and bug reports can be reproduced.
64. As an operator, I want a health endpoint, so that the container platform can tell whether the app is running.
65. As an operator, I want a command that wipes and reseeds the database, so that I can reset a demo environment.
66. As a developer, I want the API's inputs and outputs to be checked by TypeScript end to end, from frontend to backend, so that a change to the API breaks the build instead of failing at runtime.

## Implementation Decisions

The low-level design (schema, layers, module interfaces, request flows) is in the **design document**. The reasoning is in the **decisions document** (D-001 to D-015). This section summarises what an implementer must respect.

### Domain model and schema

- **Country**: id, name, ISO code, currency code (e.g. INR, USD). No currency symbol is stored; the UI formats amounts with `Intl.NumberFormat`.
- **Department**: id, name.
- **Role** (job role): id, name, department. **Each role belongs to exactly one department.** Role names are specific (e.g. "Engineering Manager", not "Manager").
- Countries, departments and roles are fixed lists inserted at boot; there's no UI for editing them.
- **Employee** (identity): id, full name, email (unique; stored lower-cased), joining date.
- **Assignment**: an employee's country, role and annual CTC, effective from a date until another date.
  - **Current assignment** = the row with no end date.
  - In the MVP, every employee has exactly one current assignment:
    - create inserts the employee and the first assignment in **one transaction**, effective from the joining date
    - update **edits the current assignment in place**, so no history is written
    - changing the joining date keeps the assignment's start date in step
    - delete is permanent and deletes the employee's assignments with it
- **Derived values:** department comes from the role and currency from the country. Neither is stored on employee data.
- **Annual CTC**: a positive integer in whole units of local currency.
- **Pay group**: the current assignments sharing one country and one role. Every statistic is per pay group, never across currencies.
- **Database rules:** CHECK constraints enforce every rule the database can, including SQLite-specific ones:
  - integer salary greater than 0
  - valid ISO dates
  - non-blank name
  - lower-case email
- **Indexes:**
  - a partial unique index allows at most one current assignment per employee
  - a partial index on (country, role, annual CTC, employee id) serves pay-group reads
- **Never use `synchronize`.** Schema changes go through committed, reviewed migrations, and tests run the same migrations.
- Every column declares its type explicitly, because esbuild-based tooling doesn't emit decorator metadata.

### Architecture

- **Monorepo:** npm workspaces with three parts: the API app, the web app, and a shared package of Zod input schemas used by both the API and the forms.
- **API layers** (ports and adapters). Imports only go downward, and an ESLint import rule enforces it:
  - **Transport (tRPC):** validates input with the shared schemas, calls one service method, rounds monetary figures, and maps domain errors to tRPC errors that carry a `field`.
  - **Logic:** services for employees, insights and lookups. Services depend only on **ports**: an employee store, a pay-group store, a lookup store, and a clock.
    - **The logic layer never imports TypeORM or driver code.**
    - Business rules live here:
      - the future-date check against the injected clock
      - checking that the country and role exist (needed because SQLite's foreign-key errors don't name the column)
      - assembling the insights
  - **Domain:** `payStats`, pure maths.
  - **Adapter (TypeORM):** private entities, the stores, the single "current assignment" query helper, a duplicate-key error classifier, the data source, migrations, and the seed writer.
  - **Composition root:** the only place that connects adapters to services.
- **Sorting and filtering:** all of it happens in SQL; all calculation happens in pure TypeScript (D-011).
- **Domain errors:** not-found (employee, country, pay group); invalid field (country or role unknown, joining date in the future); duplicate email. They map to tRPC NOT_FOUND, BAD_REQUEST and CONFLICT respectively, with the field name included for the forms.
- **Switching to Postgres:** only the adapter changes (migrations, entity checks, data-source config, error classifier). Nothing above it changes. This is designed for but not verified (out of scope).
- **Web:** React + TypeScript (Vite), Mantine, Mantine Charts, and tRPC with the TanStack Query integration.
  - Two pages: Employees and Insights.
  - Add/edit happens in a side drawer; delete uses a confirmation dialog.
  - The web app imports only the router's *type*.
- **Delivery:** one multi-stage Docker image on `node:22-slim`.
  - Runs as a non-root user, with a health check.
  - Reads `PORT` and `DATABASE_PATH` from the environment; the database lives on a mounted volume.
  - On boot: migrations, then lookups, then seed only if empty.
  - Deployed to a host before submission.

### Pay statistics module (`payStats`)

Pure, deterministic, works on numbers only, and is its own test seam. Three entry points:

- **Analyse a pay group**, given its salaries sorted ascending. Returns:
  - a summary: headcount, min, max, average, median (the mean of the two middle values for an even count), spread amount (max − min) and spread ratio (max ÷ min)
  - a histogram: 10 equal-width buckets, each including its lower bound and excluding its upper bound, except the last, which includes max; a single bucket when min = max

  All values are **unrounded**.
- **Summarise by role**, given (role, annual CTC) rows sorted by role then salary. Returns one summary per role; consecutive rows with the same role form one group.
- **Earner count**, given a headcount and a percentage: max(1, ceil(n × x ÷ 100)), capped at floor(n ÷ 2) so the lists never overlap; a group of one gives 1.

**Error modes:** it **checks** that its input is sorted rather than assuming it. Empty input, unsorted input, a salary that isn't a positive integer, a percentage outside 1–50 or a headcount below 1 each throw a range error. These are programmer errors, because validation and the not-found checks run first.

Choosing *which* employees are top and bottom earners is **not** done here. It's a SQL query (see below).

### API contract (tRPC procedures)

- **lookups.all**: countries (with currency code), departments, and roles (with department).
- **employees.list**:
  - **Input:**
    - page (≥ 1)
    - page size (**exactly one of 10, 20, 50, 100**; default 20)
    - optional search text
    - optional country / role / department filters
    - sort field (name | joiningDate | annualCtc) and direction
  - **Validation:** sorting by annualCtc without a country filter is rejected by the schema.
  - **Search:** a substring match on name or email that ignores case, written as portable SQL that works on both SQLite and Postgres.
  - **Sorting:** every sort ends with employee id.
  - **Returns** the page of employees (with country, currency code, role and department) and the total count.
- **employees.get / create / update / delete**:
  - Not-found when missing.
  - Unknown country or role → field-level bad request.
  - Future joining date → field-level bad request.
  - Duplicate email (ignoring case, checked against *other* employees on update) → field-level conflict.
  - The email is trimmed and lower-cased by the shared schema.
- **insights.countryOverview**:
  - Input: country id. Not-found if the country doesn't exist.
  - The SQL returns (role, annual CTC) from current assignments, sorted by role, salary, then id. These go to `payStats`, which summarises by role.
  - Returns one row per role that has employees (role, department, rounded summary).
- **insights.roleDetail**: input is country id, role id and percentage (1–50).
  1. SQL returns the pay group's salaries, sorted. If there are none → not-found.
  2. `payStats` analyses them → k = `payStats` earner count.
  3. SQL selects the bottom k (salary ascending, then id) and the top k (salary descending, then id ascending).
  4. Each earner gets a difference from the median.

  Returns the rounded summary, the histogram, and the bottom and top earners (id, name, salary, difference from median, joining date).
- **Rounding**, all done in the transport layer:
  - average, median, histogram bounds and differences from median → whole currency units
  - spread ratio → 2 decimal places

### Seed

- **A pure, deterministic generator** (fixed-seed random numbers and Faker) produces:
  - the fixed lists (about 6 countries, about 5 departments, about 15 roles)
  - employees, each with a first assignment
- **Data shape:**
  - Country mix: India ~40%, US ~25%, UK ~12%, Germany ~10%, Singapore ~8%, Brazil ~5%.
  - Salary = role base pay × country factor × log-normal noise, with a few planted outliers.
  - Unique emails.
  - Joining dates over the past ~15 years, never in the future.
- **The adapter writes everything in one transaction.**
- **Two ways to run it:** seed-if-empty on boot, and a manual reset command. The employee count can be set.

## Testing Decisions

### What makes a good test here

- Tests check observable behaviour through a seam: inputs in, outputs out. They never inspect private helpers, TypeORM internals or component state.
- Each test builds only the data it needs, kept small and readable inside the test. Tests never depend on the 10,000-row seed.
- Tests are deterministic. "Today" comes from an injected clock; there's no network and no shared state between tests.
- Tests are fast. The whole suite runs in seconds under Vitest.
- Tests are written test-first (red → green → refactor), and the commits show that progression.

### Seams

1. **`payStats`**: direct, table-driven tests.
   - summary: median for odd and even counts, average, spread amount and ratio, a group of one
   - histogram: bucket boundaries, max in the last bucket, min = max, counts adding up to the headcount
   - earner count: 5% of 7 → 1; 10% of 25 → 3; x = 1; x = 50
   - grouping by role
   - every range error, **including unsorted input**
2. **tRPC router**: called through `createCaller` on the app built by the composition root, against **in-memory SQLite built by running the migrations**, with a fixed clock.
   - **Employees:**
     - create / get / update / delete, including not-found
     - schema validation failures; the future date; unknown country or role
     - duplicate email ignoring case, and on update, keeping your own email is allowed
     - each field error carries its `field`
   - **List:** search, each filter, combined filters, pagination and total count, each allowed page size (and rejection of others, e.g. 25), each sort with the id tie-break, and rejection of salary sort without a country.
   - **Insights:**
     - the overview includes only roles that have employees in the chosen country and never mixes countries
     - not-found for an unknown country and for an empty pay group
     - the role detail uses only the selected pay group
     - **top/bottom tie order and difference from median** (selection is SQL, so it's tested here)
     - rounding
     - x outside 1–50 is rejected
   - **Consistency:** a newly created employee appears in both the list and the insights.
3. **Page-level React Testing Library tests** (tRPC mocked):
   - field errors appear next to their fields
   - department and currency appear when a role and country are picked
   - salary sort is disabled until a country is chosen
   - the page-size selector offers only 10, 20, 50 and 100, defaults to 20, and resets to page 1
   - the overview renders in the country's currency
   - the x% input range is enforced
   - the delete confirmation names the employee

- **Seed generator**: the same inputs give identical output, emails are unique, and no date is in the future.
- **No in-memory fake stores.** Sorting and filtering are SQL, so a fake would test the wrong thing. The only test double is the clock.
- **Not tested directly:** TypeORM internals, Fastify HTTP routing, Docker behaviour, browser end-to-end. Running the suite against real Postgres is out of scope.
- **Prior art:** none. The repo is greenfield.

## Out of Scope

- **Login and access control.** There's one persona and the data is fake. A real deployment would put the org's SSO and role-based access in front, because salary data is highly sensitive.
- **Bulk CSV/Excel import and export.** This is the natural way to migrate off Excel and the obvious next step. Doing it properly (validation, partial failures, error reports) is a feature of its own.
- **Salary history and revisions.** Only the current salary is stored, which the assessment team confirmed is acceptable.
- **Salary components** (base, bonus, allowances). Only annual CTC is stored, as confirmed by the assessment team.
- **Employment status / leavers.** Delete is permanent, which is consistent with keeping no history.
- **Exchange-rate conversion and comparisons across countries.** This would need a rates source and rules for which date's rate to use.
- **Department-level pay insights.**
- **Admin UI for editing countries, departments and roles.**
- **CI pipeline and automatic deploy.**
- **End-to-end browser tests.**
- **Multi-user concurrency and Postgres.** SQLite on one volume fits one HR user; the docs describe moving to Postgres.
- **Running the tests against real Postgres.** The switch is designed for (only the adapter changes) but not verified.

## Further Notes

- The **requirements document** must stay at **one page**.
- The **design document** and the **decisions document** are the source of truth for the schema, layers and interfaces. If this spec and the design document disagree, the design document wins.
- Decided while writing this spec or the design (not discussed explicitly before):
  - an empty pay group, or an unknown country in the overview, returns not-found
  - the default page size is 20
  - spread ratio is rounded to 2 decimal places
- The build order is set by the developer separately and is not part of this spec.
