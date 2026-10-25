# 07: Country pay overview

**What to build:** On the Insights page, HR picks a country and sees one row per role that has employees there: role, department, headcount, min, max, average, median and spread (max − min and max ÷ min), all in that country's currency and sortable by any column.

**Blocked by:** 02 (Browse employees)

**Status:** ready-for-agent

- [ ] The pure `payStats` module is written test-first. Given a pay group's salaries in ascending order, its summary returns:
  - headcount, min, max, average and median (the mean of the two middle values for an even count)
  - spread amount (max − min) and spread ratio (max ÷ min)
  - unrounded figures; a group of one is valid
- [ ] `payStats` overview grouping: given (role, salary) pairs for a country, it returns one summary per role that has employees
- [ ] Table-driven `payStats` tests cover odd and even medians, average, spread, a group of one, and grouping
- [ ] `insights.countryOverview` fetches the country's (role, salary) pairs already sorted by the database, and rounds average and median to whole units at the API boundary
- [ ] The Insights page has a country selector and a sortable roles table, with amounts in the country's currency symbol and thousands separators
- [ ] Router tests: only roles that have employees in the chosen country are included; countries are never mixed; rounding happens at the boundary
- [ ] Page test: the overview table renders the returned rows in the country's currency
