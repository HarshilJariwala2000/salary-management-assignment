# 09: Top and bottom x% earners

**What to build:** In the role detail view, HR enters a percentage x from 1 to 50 and sees the top x% and bottom x% earners in the pay group. Each person shows name, salary, difference from the median and joining date. The same inputs always give the same people.

**Blocked by:** 08 (Role detail with salary histogram)

**Status:** ready-for-agent

- [ ] `payStats` top/bottom, given a pay group's members (id + salary) and x:
  - x is a whole number from 1 to 50
  - the count is ceil(n × x ÷ 100), with a minimum of 1
  - bottom earners are ordered by salary ascending, then id ascending
  - top earners are ordered by salary descending, then id ascending
  - each result carries its difference from the median
- [ ] Table-driven `payStats` tests: 5% of 7 → 1; 10% of 25 → 3; x = 1; x = 50; tie-breaking by id; difference from median
- [ ] `insights.roleDetail` accepts the percentage (1–50) and returns top and bottom earners with name, salary, difference from median and joining date
- [ ] The detail view has a percentage input and the two earner lists
- [ ] Router test: x outside 1–50 is rejected
- [ ] Page test: the percentage input rejects values outside 1–50
