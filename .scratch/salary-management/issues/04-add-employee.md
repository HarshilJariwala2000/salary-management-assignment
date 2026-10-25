# 04: Add an employee

**What to build:** HR clicks "Add employee" and fills in a side-drawer form: name, email, country, role, joining date and annual CTC. Picking a role shows its department, and picking a country shows its currency. Errors appear next to each field as HR types, and the server applies the same rules. A successful save shows a confirmation.

**Blocked by:** 01 (Walking skeleton)

**Status:** ready-for-agent

- [ ] One shared Zod schema for employee input, used by both the API and the form:
  - name not blank
  - email valid
  - annual CTC a positive whole number
  - joining date not in the future
- [ ] "Today" is injected into the future-date check, so tests never depend on the real date
- [ ] `employees.create` stores the email lower-cased and returns the created employee with derived department and currency
- [ ] A duplicate email (ignoring case) returns a conflict error tied to the email field
- [ ] An unknown country or role id returns a bad-request error
- [ ] The drawer shows the derived department and currency as read-only, field-level errors, and a success message
- [ ] Router tests: a valid create; each validation failure; the future date (with injected today); duplicate email ignoring case; unknown country or role
- [ ] Page test: field errors appear next to their fields, and department and currency appear when role and country are picked
