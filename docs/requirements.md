# Requirements: ACME Salary Management

## 1. Goal

ACME's HR manager tracks the salaries of 10,000 employees across several countries in Excel files. This makes updates slow and error-prone, and simple pay questions take hours of manual filtering. The goal is a web application where the HR manager can **keep salary data accurate** and **answer "how do we pay people?" in seconds**, for example: *What is the median pay for a Software Engineer in India? How wide is the pay gap within that role? Who is in the bottom 10%?*

## 2. Scope

- **User:** a single persona, the HR manager.
- **Data:** each employee has a name, email, country, job role, joining date and **one current annual CTC in the country's local currency**.
  - Department comes from the job role and currency comes from the country, so neither can contradict the record.
  - Countries, departments and roles are fixed lists, so names can't be misspelled and the insights stay accurate.
- **Analysis boundary:** every pay figure is calculated **within one country**, comparing employees with the same role (a "pay group"). Salaries are never mixed across currencies.
- **Delivery:** a web app (React UI, Node/TypeScript API, SQLite) packaged as one Docker image. It comes pre-filled with 10,000 realistic, reproducible employees and is deployed to a public host.

## 3. Features

| Area | What HR can do |
|---|---|
| **Employee list** | Search by name or email. Filter by country, role or department. Sort by name or joining date, and by salary once a country is selected. HR chooses 10, 20 (default), 50 or 100 employees per page. |
| **Add / edit / delete** | Use a side-panel form with checks for name, email (unique), salary (a positive whole number) and joining date (not in the future). Deleting asks for confirmation and names the employee. |
| **Country insights** | Pick a country to see one row per role: headcount, min, max, average, median, and spread (max − min and max ÷ min). |
| **Role detail** | See a histogram of salaries with the median marked, and the **top and bottom x% of earners** for x from 1 to 50. Each earner shows salary, difference from the median and joining date. |

**Top/bottom x% rules:** the list size is x% of the group, rounded up, with at least 1, and never more than half the group, so the two lists never overlap (a group of one is the only exception: its one employee is both). x runs from 1 to 50. Equal salaries are ordered by employee ID so results are always the same.

## 4. Out of scope (and why)

| Left out | Reasoning |
|---|---|
| **Login and access control** | There is one user and the data is fake, so a login screen would only slow reviewers down. Real salary data is highly sensitive, so production would require company single sign-on and access by role. |
| **Salary history** | Only the current salary is needed to answer today's pay questions, and the assessment team confirmed this is acceptable. Tracking changes over time is a separate, much larger feature. |
| **Salary breakdown** (base, bonus, allowances) | The breakdown differs by country. Annual CTC alone answers the pay questions, and the assessment team confirmed this. |
| **Cross-country comparison and currency conversion** | Averaging rupees with dollars is meaningless. Doing it correctly needs a source of exchange rates and a rule for which date's rate to use, which would add risk without improving the main insights. |
| **Bulk Excel/CSV import and export** | This is the natural way to move off Excel and the strongest next feature. Done properly it needs row-by-row checks, handling of partial failures and error reports, which is too much for this MVP. |
| **Leavers / employment status** | No history is kept, so deleting a leaver is consistent. A leaver status only makes sense once salary history exists. |
| **Top/bottom by a fixed number of employees** (e.g. "lowest 5"), or a toggle between % and number | This would be scope creep. A percentage means the same thing in a group of 400 or of 20, so roles and countries can be compared fairly. A fixed number does not: "top 5" is 1% of one group and nearly all of another. A number option would also need its own limit per group, so the top and bottom lists never overlap, plus more input rules and tests. That is extra complexity without a new insight. |
| **Department-level insights** | Pay varies most by role and country. Every role belongs to one department, so a department view can be added later without changing the data structure. |
| **Admin screens for countries, departments and roles** | These lists rarely change. They are set when the database is first filled with data, which keeps the role groupings that every insight depends on stable. |
| **Multiple simultaneous users and a scalable database** | SQLite on one disk comfortably serves one HR user and 10,000 rows. Switching to Postgres is the documented path if more users need access. |
| **Automated build pipeline and browser-based tests** | Not needed for a single-developer MVP. Fast unit and API tests cover the core behaviour. |
