# 09: Top and bottom x% earners

**What to build:** In the role detail view, HR enters a percentage x from 1 to 50 and sees the top x% and bottom x% earners in the pay group. Each person shows name, salary, difference from the median and joining date. The same inputs always give the same people.

**Blocked by:** 08 (Role detail with salary histogram)

**Status:** done

- [x] `payStats.earnerCount(headcount, percent)` = max(1, ceil(n × x ÷ 100)), capped at floor(n ÷ 2) so the lists never overlap; a group of one gives 1. `RangeError` for a percent outside 1–50, a non-integer percent, or a headcount below 1
- [x] Table-driven tests: 5% of 7 → 1; 10% of 25 → 3; 50% of 3 → 1 (capped); 50% of 10 → 5; x = 1; a group of one; each `RangeError`
- [x] `PayGroupStore.earners(countryId, roleId, k)` **selects in SQL**:
  - bottom: `ORDER BY annual_ctc ASC, employee_id ASC LIMIT k`
  - top: `ORDER BY annual_ctc DESC, employee_id ASC LIMIT k`
  - returns id, name, annual CTC and joining date
- [x] The insights service `roleDetail` accepts the percentage, computes k, fetches the earners, and adds `differenceFromMedian = annualCtc − median` to each
- [x] The router rounds the differences
- [x] `insights.roleDetail` validates the percentage (integer 1–50) with Zod
- [x] The detail view has a percentage input and the two earner lists
- [x] Router tests:
  - **tie order** on both sides
  - difference from median
  - k for small groups
  - x outside 1–50 is rejected
- [x] Page test: the percentage input rejects values outside 1–50

## Comments

- Found before the first test: rounding up let small groups overlap (3 people at 50% listed 2 at each end). Agreed with the developer: cap the count at floor(n/2); a group of one is the only case where one person is both, and the page says so. Requirements, D-006, design, clarifications and spec were updated first.
- Differences from the median round half away from zero (`roundMoney`), so -0.5 becomes -1, not -0. Now used for every amount the API rounds.
- Selection is SQL with `LIMIT k`; the top list orders by salary descending then id ascending, so ties are not flipped.
- The percentage input validates 1-50 in the browser too; invalid values are never sent and the last valid lists stay visible.
- The no-overlap and out-of-range router checks passed on first run (earnerCount and the shared schema delivered them) and are committed as guards.
