# 08: Role detail with salary histogram

**What to build:** HR clicks a role in the country overview and sees the pay group's detail: the summary figures again, plus a histogram of salaries with the median marked. They can go back to the overview easily.

**Blocked by:** 07 (Country pay overview)

**Status:** ready-for-agent

- [ ] `payStats` histogram: about 10 equal-width buckets from min to max; the last bucket includes max; when min = max there's a single bucket holding the whole group. Each bucket has a lower bound, upper bound and count
- [ ] Table-driven `payStats` tests cover bucket boundaries, max included, and min = max
- [ ] `insights.roleDetail` (country, role) returns the rounded summary and the buckets. An empty pay group returns not-found
- [ ] The detail view opens from a role row and shows the summary, a Mantine Charts histogram with the median marked, and a way back to the overview
- [ ] The UI shows an empty state when the pay group is empty
- [ ] Router tests: only the selected pay group's salaries are used; not-found for an empty pay group
