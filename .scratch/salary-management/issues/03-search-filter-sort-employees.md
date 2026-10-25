# 03: Search, filter and sort the employee list

**What to build:** HR narrows the employee list by searching name or email (ignoring case) and by filtering on country, role and department, in any combination. They can sort by name or joining date, and by salary once a country is selected, so ₹ and $ amounts are never ranked together.

**Blocked by:** 02 (Browse employees)

**Status:** done

- [x] Search: a substring match on name or email that ignores case
- [x] Country, role and department filters, combinable with each other and with search
- [x] Sort by name, joining date or annual CTC, ascending or descending
- [x] The API rejects sorting by annual CTC without a country filter (shared schema validation)
- [x] In the UI, salary sort is disabled with a short explanation until a country is selected
- [x] Changing search, a filter or the sort returns to page 1
- [x] An empty state is shown when nothing matches
- [x] Router tests: search, each filter, combined filters, each sort, and rejection of salary sort without a country
- [x] Page test: salary sort is disabled until a country filter is set

## Comments

- Search is portable `lower(...) LIKE` with an escaped pattern, so `%` and `_` typed by HR are literal.
- Sort columns come from a fixed map, never from input text; every ORDER BY ends with employee id.
- The salary-sort rule lives in the shared schema (a refine), so the API rejects it and the form knows it.
- The search box is debounced (250 ms). Filters and sort are dropdowns; clearing the country drops a salary sort back to name order.
- While working this ticket, the shared schemas were found untracked since ticket 02 (the cycle script only staged `apps/`). Fixed forward in `ce2c11c`, verified on a fresh clone; the script now stages `packages/` too.
