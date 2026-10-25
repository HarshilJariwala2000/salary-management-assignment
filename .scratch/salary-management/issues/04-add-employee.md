# 04: Add an employee

**What to build:** HR clicks "Add employee" and fills in a side-drawer form: name, email, country, role, joining date and annual CTC. Picking a role shows its department, and picking a country shows its currency. Errors appear next to each field as HR types, and the server applies the same rules. A successful save shows a confirmation.

**Blocked by:** 01 (Walking skeleton)

**Status:** ready-for-agent

- [ ] One shared Zod employee schema, used by the API and the form:
  - name trimmed and not blank
  - email valid, trimmed and lower-cased
  - annual CTC a positive integer
  - joining date an ISO date
- [ ] Employee service `create` checks business rules **before** writing:
  - a joining date after `clock.today()` → `InvalidField(joiningDate, future)`
  - an unknown country → `InvalidField(countryId, unknown)`, and an unknown role → `InvalidField(roleId, unknown)`, both checked via `LookupStore`
- [ ] `EmployeeStore.create` inserts the employee and its first assignment (effective from the joining date) in **one transaction**, and returns an `EmployeeView`
- [ ] The adapter's error classifier turns SQLite's unique violation on `employee.email` into `DuplicateEmail`
- [ ] The middleware maps these to BAD_REQUEST / CONFLICT, with `data.field` set
- [ ] The drawer shows the derived department and currency as read-only, field-level errors (including the server's `field`), and a success message
- [ ] Router tests:
  - a valid create
  - each Zod failure
  - a future date, with a fixed clock
  - unknown country or role
  - a duplicate email ignoring case
  - each error carries the right `field`
  - **a created employee appears in both the list and the insights**
- [ ] Page test: field errors appear next to their fields, and department and currency appear when role and country are picked
