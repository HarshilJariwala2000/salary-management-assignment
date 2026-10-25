# 05: Edit an employee

**What to build:** From an employee's row in the list, HR opens the same drawer with the current values filled in, changes details or salary, and saves. The list shows the change immediately.

**Blocked by:** 02 (Browse employees), 04 (Add an employee)

**Status:** done

- [x] `employees.get` returns an `EmployeeView` by id, or `NotFound`
- [x] Employee service `update` applies the same rules as create, plus `NotFound`
- [x] `EmployeeStore.update` changes the employee and its **current assignment in place** (no history row). Changing the joining date updates the current assignment's start date to match
- [x] A duplicate email is checked against *other* employees only
- [x] An edit action on each row opens the drawer with the current values. After saving, the list refreshes and a success message is shown
- [x] Router tests:
  - get and update
  - not-found
  - keeping your own email is allowed
  - taking another employee's email is a conflict
  - after an edit the list still holds exactly one employee with the new values (the insights half moved to ticket 07)

## Comments

- Create and update share one set of business rules (`checkDraft` in the employee service), driven by a test that update rejects what create rejects.
- The current assignment's start date follows an edited joining date (in the store's update), but no seam can observe it yet: the API never exposes `effective_from`. It becomes observable once salary history exists.
- The web fixtures' lookups were aligned with the employees they list, so prefilled selects show the right country and role.
