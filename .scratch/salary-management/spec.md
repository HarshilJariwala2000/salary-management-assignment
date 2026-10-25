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

### Domain model

- **Country**: id, name, ISO code, currency code (e.g. INR, USD, GBP, EUR, SGD, BRL), currency symbol. The fixed list is created by the seed; there's no UI for editing it.
- **Department**: id, name. The fixed list is created by the seed.
- **Role** (job role): id, name, department. **Each role belongs to exactly one department.** Role names are specific (e.g. "Engineering Manager", not "Manager"). The fixed list is created by the seed.
- **Employee**: id, full name, email (unique, ignoring case; stored lower-cased), country, role, joining date, annual CTC.
  - Department is **derived from role** and currency is **derived from country**. Neither is stored on the employee.
- **Annual CTC** is a positive integer in whole units of the country's currency. Decimals, salary components and salary history are not modelled.
- **Pay group**: the employees sharing one country and one role. Every pay statistic is computed per pay group. Monetary figures are never combined across countries.
- Database index on (country, role, annual CTC), to serve fetching a pay group's salaries in sorted order.

### Architecture

- npm workspaces monorepo with three parts: the API app, the web app, and a shared package.
- **Shared package**: Zod schemas for every API input (employee create/update, list query, insights queries). The API validates with them and the web forms reuse them. It contains no server runtime code.
- **API**: Node + TypeScript on Fastify.
  - Fastify hosts the tRPC API (via the Fastify adapter), serves the built React app as static files, and exposes a health endpoint.
  - The web app imports only the router's *type* from the API.
- **Data access**: TypeORM with the `better-sqlite3` driver.
  - Entities use decorators, with the column type written out on every column. esbuild-based tooling (Vitest, tsx) doesn't emit decorator metadata, so TypeORM can't infer the types.
  - Schema changes use TypeORM migrations committed to the repo. `synchronize` is used only in tests against an in-memory database.
  - Read-heavy queries use the query builder with explicit column selection.
- **Web**: React + TypeScript (Vite), Mantine components, Mantine Charts for the histogram, and tRPC with the TanStack Query integration.
  - Two top-level pages: Employees and Insights.
  - Add/edit happens in a side drawer. Delete uses a confirmation dialog.
- **Delivery**: one multi-stage Docker image on `node:22-slim`. Alpine isn't used because `better-sqlite3` is a native module and won't build reliably there.
  - Runs as a non-root user, with a health check.
  - Reads `PORT` and `DATABASE_PATH` from the environment; the database file lives on a mounted volume (default `/data/salary.db`).
  - A compose file starts the image with that volume attached.
  - On boot, the app runs pending migrations, then seeds only if there are no employees.
  - The image is host-agnostic and will be deployed to a host before submission.

### Pay statistics module (`payStats`)

A pure, deterministic module with no I/O and no knowledge of the database or HTTP. **It is a main test seam in its own right** (see Testing Decisions). Its interface:

- **Summary of a pay group**, given its salaries in ascending order:
  - Returns headcount, min, max, average, median, spread amount (max − min) and spread ratio (max ÷ min).
  - Median: the middle value for an odd count, the mean of the two middle values for an even count.
  - Average and median are returned unrounded. Rounding to whole currency units happens once, at the API boundary.
  - A group of one is valid: min = max = median = average, spread 0, ratio 1.
- **Top and bottom earners**, given a pay group's members (id + salary) and a percentage x:
  - x must be a whole number from 1 to 50.
  - The count is ceil(n × x ÷ 100), with a minimum of 1.
  - Bottom earners are ordered by salary ascending, ties by employee id ascending. Top earners are ordered by salary descending, ties by employee id ascending.
  - Each result carries its difference from the group median.
- **Histogram buckets**, given a pay group's salaries:
  - About 10 equal-width buckets from min to max. The last bucket includes max.
  - Each bucket returns its lower bound, upper bound and count.
  - When min = max, there's a single bucket holding the whole group.
- **Overview grouping**, given (role, salary) pairs for a country: returns one summary per role that has employees.

### API contract (tRPC procedures)

- **lookups.all**: all countries (with currency), departments, and roles (with department), for dropdowns and labels.
- **employees.list**:
  - Input: page (≥ 1), page size (**exactly one of 10, 20, 50, 100**; default 20; any other value is rejected by schema validation), optional search text, optional country / role / department filters, sort field (name | joiningDate | annualCtc), sort direction.
  - **Sorting by annualCtc without a country filter is rejected** by schema validation.
  - Returns the page of employees, with derived department and currency included, plus the total count.
  - Search is a case-insensitive substring match on name and email.
- **employees.get**: one employee by id. Not-found error if missing.
- **employees.create / employees.update**:
  - Validated with the shared schema.
  - A duplicate email (ignoring case) returns a conflict error naming the email field.
  - An unknown country or role id returns a bad-request error.
- **employees.delete**: permanent delete by id. Not-found error if missing.
- **insights.countryOverview**:
  - Input: country id.
  - Returns the country (with currency) and one row per role that has employees: role, department and the rounded summary statistics.
- **insights.roleDetail**:
  - Input: country id, role id, percentage (1–50).
  - Returns the rounded summary, histogram buckets, top earners and bottom earners. Each earner has id, name, salary, difference from median and joining date.
  - An empty pay group returns a not-found error, and the UI shows an empty state.
- The router fetches each pay group's salaries **already sorted by the database** and passes them to `payStats`. `payStats` assumes sorted input and doesn't re-sort.

### Seed

- **Deterministic**: fixed seeds for both the random number generator and Faker, so every run gives byte-identical data.
- **About 6 countries with uneven headcount**: India ~40%, US ~25%, UK ~12%, Germany ~10%, Singapore ~8%, Brazil ~5%.
- **About 15 roles across about 5 departments.**
- **Salary** = role base pay × country factor × log-normal noise. A small number of outliers are placed deliberately so the top/bottom view has something to show.
- **Emails are made unique** with a counter suffix.
- **Joining dates** spread over the past ~15 years, never in the future.
- All rows are inserted in one transaction.
- Exposed in two ways:
  - Seed-if-empty runs automatically on boot.
  - A manual reset command wipes and reseeds the data.
- The employee count can be set, so tests can seed a small number.

## Testing Decisions

### What makes a good test here

- Tests check observable behaviour through a seam: inputs in, outputs out. They never inspect private helpers, TypeORM internals or component state.
- Each test builds only the data it needs, kept small and readable inside the test. Tests never depend on the 10,000-row seed.
- Tests are deterministic. There's no wall-clock dependence; "today" is injected wherever the future-date check needs it. There's no network and no shared state between tests.
- Tests are fast. The whole suite runs in seconds under Vitest.
- Tests are written test-first (red → green → refactor), and the commits show that progression.

### Seams

1. **`payStats` (main seam for all pay maths).** Pure functions with direct, table-driven tests. All maths edge cases live here:
   - median for odd and even counts, average, spread amount and ratio, a group of one
   - top/bottom count rounding (e.g. 5% of 7 → 1; 10% of 25 → 3), the minimum of 1, x = 1 and x = 50
   - tie-breaking by employee id, and difference from median
   - histogram bucket boundaries, max included in the last bucket, and min = max
   - overview grouping

   Choosing this as its own seam means the `payStats` interface is a deliberate, stable contract. This was the developer's choice over testing it only through the router: the maths gets fast, precise tests, at the cost of freezing that interface.
2. **tRPC router, called in-process through `createCaller` against an in-memory SQLite database.** Covers employee management and the *wiring* of insights, without repeating the maths cases:
   - create / get / update / delete, including not-found
   - shared-schema validation failures, including the future-date check with an injected "today"
   - duplicate email ignoring case
   - unknown country or role
   - list search, each filter, combined filters, pagination and total count, each allowed page size (and rejection of any other, e.g. 25), each sort, and rejection of salary sort without a country
   - insights:
     - the overview includes only roles that have employees in the chosen country, and never mixes countries
     - roleDetail draws only from the right pay group, passes salaries sorted, and rounds at the boundary
     - roleDetail rejects x outside 1–50 and returns not-found for an empty pay group
3. **Page-level React Testing Library tests for the Employees and Insights pages**, with the tRPC client mocked:
   - form validation messages appear next to their fields
   - department and currency appear when a role and country are picked
   - salary sort is disabled until a country filter is set
   - the page-size selector offers only 10, 20, 50 and 100, defaults to 20, and returns to page 1 when changed
   - the overview table renders the returned rows in the country's currency
   - the percentage input rejects values outside 1–50
   - the delete confirmation names the employee

   Individual components aren't tested on their own.

- **Seed smoke test**: seeding a small count twice produces identical output, every email is unique, and no joining date is in the future.
- **Not tested directly**: TypeORM repositories, Fastify HTTP routing, Docker image behaviour, and anything end-to-end in a browser.
- **Prior art**: none. The repo is greenfield, so these tests set the patterns.

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

## Further Notes

- Decisions and their reasoning will go in `docs/decisions.md`, one numbered entry each:
  - SQLite vs Postgres
  - TypeORM vs Drizzle
  - tRPC vs REST, with the trade-off: no public REST API, and `trpc-to-openapi` as the way out
  - insights kept within one country
  - no authentication
  - the top/bottom x% rules
  - `payStats` as its own test seam
- `docs/requirements.md` must stay at **one page** and be committed before any application code.
- Decided while writing this spec (not discussed explicitly before):
  - emails are unique ignoring case and stored lower-cased
  - an empty pay group returns not-found from roleDetail
  - the default page size is 20 (the developer chose the options 10 / 20 / 50 / 100; the default was picked from them)
  - average and median are rounded only at the API boundary
- The build order is set by the developer separately and is not part of this spec.
