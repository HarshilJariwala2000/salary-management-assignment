# 05: Edit an employee

**What to build:** From an employee's row in the list, HR opens the same drawer with the current values filled in, changes details or salary, and saves. The list shows the change immediately.

**Blocked by:** 02 (Browse employees), 04 (Add an employee)

**Status:** ready-for-agent

- [ ] `employees.get` returns an `EmployeeView` by id, or `NotFound`
- [ ] Employee service `update` applies the same rules as create, plus `NotFound`
- [ ] `EmployeeStore.update` changes the employee and its **current assignment in place** (no history row). Changing the joining date updates the current assignment's start date to match
- [ ] A duplicate email is checked against *other* employees only
- [ ] An edit action on each row opens the drawer with the current values. After saving, the list refreshes and a success message is shown
- [ ] Router tests:
  - get and update
  - not-found
  - keeping your own email is allowed
  - taking another employee's email is a conflict
  - after an edit there is still exactly one current assignment, and the new salary shows in the insights
