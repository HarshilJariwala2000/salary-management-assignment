# 06: Delete an employee

**What to build:** HR deletes an employee from their row in the list, after a confirmation that names the employee. The deletion is permanent, consistent with keeping no salary history.

**Blocked by:** 02 (Browse employees)

**Status:** done

- [x] `employees.delete` permanently deletes by id. Not-found error if missing
- [x] A delete action on each row opens a confirmation dialog that names the employee
- [x] After confirming, the list refreshes and a success message is shown
- [x] Router tests: delete removes the employee; deleting a missing id returns not-found
- [x] Page test: the confirmation names the employee

## Comments

- Hard delete with `RETURNING id`, so the store knows whether anything was deleted; the service turns "nothing" into NotFound. Assignments go with the employee (ON DELETE CASCADE), shown by the insights no longer counting them.
- A failed delete keeps the dialog open with a "Not deleted: …" alert.
