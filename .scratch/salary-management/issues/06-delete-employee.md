# 06: Delete an employee

**What to build:** HR deletes an employee from their row in the list, after a confirmation that names the employee. The deletion is permanent, consistent with keeping no salary history.

**Blocked by:** 02 (Browse employees)

**Status:** ready-for-agent

- [ ] `employees.delete` permanently deletes by id. Not-found error if missing
- [ ] A delete action on each row opens a confirmation dialog that names the employee
- [ ] After confirming, the list refreshes and a success message is shown
- [ ] Router tests: delete removes the employee; deleting a missing id returns not-found
- [ ] Page test: the confirmation names the employee
