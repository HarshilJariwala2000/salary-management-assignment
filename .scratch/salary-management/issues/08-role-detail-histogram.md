# 08: Role detail with salary histogram

**What to build:** HR clicks a role in the country overview and sees the pay group's detail: the summary figures again, plus a histogram of salaries with the median marked. They can go back to the overview easily.

**Blocked by:** 07 (Country pay overview)

**Status:** ready-for-agent

- [ ] `analysePayGroup` also returns the histogram:
  - 10 equal-width buckets, each including its lower bound and excluding its upper bound, except the last, which includes max
  - a single bucket when min = max
  - counts add up to the headcount
  - unrounded bounds
- [ ] Table-driven `payStats` tests: bucket boundaries, max in the last bucket, min = max, counts add up
- [ ] `PayGroupStore.groupSalaries(countryId, roleId)` reads current assignments **sorted in SQL** by salary, then id
- [ ] The insights service `roleDetail`: an empty pay group → `NotFound(payGroup)`; otherwise it returns the summary and histogram
- [ ] The router rounds the summary and the histogram bounds
- [ ] The detail view opens from a role row and shows the summary, a Mantine Charts histogram with the median marked, an empty state, and a way back to the overview
- [ ] Router tests: only the selected pay group's salaries are used; not-found for an empty pay group; rounding of bounds
