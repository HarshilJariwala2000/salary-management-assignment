# 08: Role detail with salary histogram

**What to build:** HR clicks a role in the country overview and sees the pay group's detail: the summary figures again, plus a histogram of salaries with the median marked. They can go back to the overview easily.

**Blocked by:** 07 (Country pay overview)

**Status:** done

- [x] `analysePayGroup` also returns the histogram:
  - 10 equal-width buckets, each including its lower bound and excluding its upper bound, except the last, which includes max
  - a single bucket when min = max
  - counts add up to the headcount
  - unrounded bounds
- [x] Table-driven `payStats` tests: bucket boundaries, max in the last bucket, min = max, counts add up
- [x] `PayGroupStore.groupSalaries(countryId, roleId)` reads current assignments **sorted in SQL** by salary, then id
- [x] The insights service `roleDetail`: an empty pay group → `NotFound(payGroup)`; otherwise it returns the summary and histogram
- [x] The router rounds the summary and the histogram bounds
- [x] The detail view opens from a role row and shows the summary, a Mantine Charts histogram with the median marked, an empty state, and a way back to the overview
- [x] Router tests: only the selected pay group's salaries are used; not-found for an empty pay group; rounding of bounds

## Comments

- The bar chart is decorative (`aria-hidden`): Recharts cannot lay out in jsdom, and the same buckets are in a captioned "Salary distribution" table that screen readers and the page tests read. The chart was checked to build, not seen rendered; ticket 13's walkthrough should eyeball it.
- The median is marked on the bucket that contains it.
- The not-found guard for an empty or unknown pay group passed on first run (the role-detail step delivered it).
