# 02: Browse employees, with seeded data

**What to build:** HR opens the Employees page and sees a paginated list of 10,000 realistic employees. They can choose 10, 20 (default), 50 or 100 per page and see the total count. Each row shows name, email, country, role, department (from the role), joining date, and annual CTC in the country's currency.

**Blocked by:** 01 (Walking skeleton)

**Status:** ready-for-agent

- [ ] The seed is deterministic, so the same run produces identical data:
  - countries weighted India ~40%, US ~25%, UK ~12%, Germany ~10%, Singapore ~8%, Brazil ~5%
  - salary = role base pay × country factor × log-normal noise, with a few deliberate outliers
  - unique emails
  - joining dates spread over the past ~15 years, never in the future
  - all rows inserted in one transaction
- [ ] On boot, the app runs pending migrations, then seeds only if there are no employees. A manual reset command wipes and reseeds
- [ ] The seed count can be set. Smoke test: seeding a small count twice gives identical output, all emails are unique, and no joining date is in the future
- [ ] `employees.list` accepts a page (≥ 1) and a page size of **exactly** 10, 20, 50 or 100 (default 20; anything else rejected), and returns rows (with derived department and currency) plus the total count
- [ ] The Employees page shows the table, page controls, the page-size selector and the total count. Changing the page size returns to page 1
- [ ] Router tests cover pagination, total count, each allowed page size, and rejection of another value (e.g. 25)
- [ ] Page test: the selector offers only 10/20/50/100, defaults to 20, and resets to page 1 when changed
