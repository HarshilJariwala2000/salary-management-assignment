# 05: Edit an employee

**What to build:** From an employee's row in the list, HR opens the same drawer with the current values filled in, changes details or salary, and saves. The list shows the change immediately.

**Blocked by:** 02 (Browse employees), 04 (Add an employee)

**Status:** ready-for-agent

- [ ] `employees.get` returns one employee by id. Not-found error if missing
- [ ] `employees.update` uses the same shared schema and rules as create. A duplicate email (ignoring case) is checked against *other* employees only
- [ ] An edit action on each row opens the drawer with the current values
- [ ] After saving, the list refreshes and a success message is shown
- [ ] Router tests: get and update; not-found; keeping your own email is allowed; taking another employee's email is a conflict
