# 04: Add an employee

**What to build:** HR clicks "Add employee" and fills in a side-drawer form: name, email, country, role, joining date and annual CTC. Picking a role shows its department, and picking a country shows its currency. Errors appear next to each field as HR types, and the server applies the same rules. A successful save shows a confirmation.

**Blocked by:** 01 (Walking skeleton)

**Status:** done

- [x] One shared Zod employee schema, used by the API and the form:
  - name trimmed and not blank
  - email valid, trimmed and lower-cased
  - annual CTC a positive integer
  - joining date an ISO date
- [x] Employee service `create` checks business rules **before** writing:
  - a joining date after `clock.today()` → `InvalidField(joiningDate, future)`
  - an unknown country → `InvalidField(countryId, unknown)`, and an unknown role → `InvalidField(roleId, unknown)`, both checked via `LookupStore`
- [x] `EmployeeStore.create` inserts the employee and its first assignment (effective from the joining date) in **one transaction**, and returns an `EmployeeView`
- [x] The adapter's error classifier turns SQLite's unique violation on `employee.email` into `DuplicateEmail`
- [x] Add the domain-error tRPC middleware and `errorFormatter` (moved here from ticket 01): `NotFound` → NOT_FOUND, `InvalidField` → BAD_REQUEST, `DuplicateEmail` → CONFLICT, with `data.field` set; any other error → INTERNAL_SERVER_ERROR
- [x] The drawer shows the derived department and currency as read-only, field-level errors (including the server's `field`), and a success message
- [x] Router tests:
  - a valid create
  - each Zod failure
  - a future date, with a fixed clock
  - unknown country or role
  - a duplicate email ignoring case
  - each error carries the right `field`
  - **a created employee appears in the list** (the insights half moved to ticket 07, which builds the insights)
- [x] Page test: field errors appear next to their fields, and department and currency appear when role and country are picked

## Comments

- Error middleware and `errorFormatter` built here, driven by the future-date, unknown country/role and duplicate-email tests. `createCaller` bypasses the formatter, so `data.field` was checked by hand over HTTP: a future date gives 400 with `field: joiningDate`, a duplicate email gives 409 with `field: email`.
- Normalisation and schema-rejection tests passed on first run (the shared schema came with the first create step) and are committed as guards.
- The web form runs the same Zod schema as the API. Server-side field errors land on their input; any other failure shows a "Not saved" alert and keeps what was typed.
- The page-test helper waits for the dropdowns to fill before interacting, as a user would.
