# 09: Top and bottom x% earners

**What to build:** In the role detail view, HR enters a percentage x from 1 to 50 and sees the top x% and bottom x% earners in the pay group. Each person shows name, salary, difference from the median and joining date. The same inputs always give the same people.

**Blocked by:** 08 (Role detail with salary histogram)

**Status:** ready-for-agent

- [ ] `payStats.earnerCount(headcount, percent)` = max(1, ceil(n × x ÷ 100)). `RangeError` for a percent outside 1–50, a non-integer percent, or a headcount below 1
- [ ] Table-driven tests: 5% of 7 → 1; 10% of 25 → 3; x = 1; x = 50; each `RangeError`
- [ ] `PayGroupStore.earners(countryId, roleId, k)` **selects in SQL**:
  - bottom: `ORDER BY annual_ctc ASC, employee_id ASC LIMIT k`
  - top: `ORDER BY annual_ctc DESC, employee_id ASC LIMIT k`
  - returns id, name, annual CTC and joining date
- [ ] The insights service `roleDetail` accepts the percentage, computes k, fetches the earners, and adds `differenceFromMedian = annualCtc − median` to each
- [ ] The router rounds the differences
- [ ] `insights.roleDetail` validates the percentage (integer 1–50) with Zod
- [ ] The detail view has a percentage input and the two earner lists
- [ ] Router tests:
  - **tie order** on both sides
  - difference from median
  - k for small groups
  - x outside 1–50 is rejected
- [ ] Page test: the percentage input rejects values outside 1–50
