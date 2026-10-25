# 07: Country pay overview

**What to build:** On the Insights page, HR picks a country and sees one row per role that has employees there: role, department, headcount, min, max, average, median and spread (max − min and max ÷ min), all in that country's currency and sortable by any column.

**Blocked by:** 02 (Browse employees)

**Status:** done

- [x] `payStats.analysePayGroup(sortedSalaries)` summary, written test-first:
  - headcount, min, max, average, median (the mean of the two middle values for an even count), spread amount and ratio
  - unrounded
  - **checks the input is sorted**
  - `RangeError` on empty input, unsorted input, or a salary that isn't a positive integer
- [x] `payStats.summariseByRole(rows)`: rows sorted by role then salary; consecutive runs of the same role form one group; `[]` gives `[]`
- [x] Table-driven `payStats` tests: odd and even median, average, spread, a group of one, grouping, every `RangeError`
- [x] `PayGroupStore.salariesByRole(countryId)` reads current assignments, **sorted in SQL** by role, salary, then id
- [x] The insights service `countryOverview`:
  - unknown country → `NotFound(country)`
  - otherwise calls `summariseByRole` and fills in role and department names from the lookups
- [x] The router rounds average and median to whole units, and the spread ratio to 2 decimal places
- [x] The Insights page has a country selector and a sortable roles table, formatted with `Intl.NumberFormat`
- [x] Router tests:
  - only roles that have employees in the chosen country are included
  - countries are never mixed
  - not-found for an unknown country
  - rounding
- [x] Page test: the overview table renders the returned rows in the country's currency
- [x] Router test (moved from ticket 04): an employee created through `employees.create` is counted in the overview
- [x] Router test (moved from ticket 05): after `employees.update` changes a salary, the overview reflects the new salary and the old one is gone

## Comments

- `analysePayGroup` returns only the summary in this ticket; ticket 08 adds the histogram to the same return value.
- Rows are ordered by role name in the service; the table re-sorts them in the browser when HR clicks a header. Those columns (median, spread) are computed by payStats, not stored, so SQL cannot sort them. Flagged against D-011 for the developer.
- The not-found, empty-country and create/update wiring tests (the last two moved here from tickets 04 and 05) passed on first run and are committed as guards.
