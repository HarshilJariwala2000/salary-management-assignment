# 02: Browse employees, with seeded data

**What to build:** HR opens the Employees page and sees a paginated list of 10,000 realistic employees. They can choose 10, 20 (default), 50 or 100 per page and see the total count. Each row shows name, email, country, role, department, joining date, and annual CTC formatted in the country's currency with `Intl.NumberFormat`.

**Blocked by:** 01 (Walking skeleton)

**Status:** done

- [x] A **pure** seed generator (`generateSeed({ count, seed })`, fixed-seed random numbers and Faker) produces employees, each with a first assignment (effective from the joining date):
  - countries weighted India ~40%, US ~25%, UK ~12%, Germany ~10%, Singapore ~8%, Brazil ~5%
  - salary = role base pay × country factor × log-normal noise, with a few planted outliers
  - unique emails
  - joining dates over the past ~15 years, never in the future
- [x] The adapter's seed writer inserts everything in one transaction. On boot it seeds only if there are no employees. A manual reset command wipes and reseeds
- [x] Seed generator test: the same inputs give identical output, emails are unique, and no date is in the future
- [x] `EmployeeStore.list` reads through the **current-assignment helper** (always `effective_to IS NULL`):
  - it joins country, role and department
  - pagination happens in SQL, and every ORDER BY ends with employee id
  - a separate count query, converted with `Number()`
- [x] `employees.list` accepts a page (≥ 1) and a page size of **exactly** 10, 20, 50 or 100 (default 20; anything else is rejected by Zod), and returns `{ rows, total }`
- [x] The Employees page shows the table, page controls, the page-size selector and the total count. Changing the page size returns to page 1
- [x] Router tests: pagination, total count, each allowed page size, and rejection of another value (e.g. 25)
- [x] Page test: the selector offers only 10/20/50/100, defaults to 20, and resets to page 1 when changed

## Comments

- Seed: 10k employees generate and write in about 0.1 s. Boot seeds only an empty database; `npm run seed:reset -w @salary/api` reseeds. Verified by hand.
- Names are built from first + last name. Faker's `fullName()` adds titles ("Ms.") and suffixes ("IV"), which leaked into emails; a red test caught it.
- Salaries format with `en-US`, except INR with `en-IN` lakh grouping. `en-SG` would show SGD as `$`, ambiguous next to USD.
- The row-shape and page-size tests passed on first run (the pagination step already delivered them) and are committed as guard tests, not red/green pairs.
- The fixed lists moved from the adapter into the pure `seed/` module (prefactor), which the design's layer diagram now shows.
