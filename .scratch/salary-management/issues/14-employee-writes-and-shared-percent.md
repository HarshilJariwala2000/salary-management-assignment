# 14: One employee-writes module, and the top/bottom % rule from the shared package

**What to build:** Two frontend deepenings from the architecture review. (1) Add, edit and delete share one module that saves, confirms, refreshes what the write made stale and reports problems; Insights never shows pay figures from before a write. (2) The role detail validates the top/bottom percentage with the shared schema instead of a hand-written copy of the rule.

**Blocked by:** none

**Status:** done

- [x] `useEmployeeWrites()` in `apps/web/src/employees/` gives `create`, `update` and `remove`, each resolving to `SubmitProblem | void` and never throwing, plus a pending flag for each
- [x] It shows the success notification ("<name> added / updated / deleted")
- [x] After a write it invalidates `employees.*` and removes cached `insights.*`, so Insights shows a loader rather than old figures
- [x] `submitProblem.ts` is folded into the module; `SubmitProblem` stays in `EmployeeForm.tsx`
- [x] The drawers and the delete modal keep only their UI and close when no problem comes back; the modal keeps its "Not deleted: …" message in local state
- [x] `@salary/shared` exports `topBottomPercent` (whole number 1–50, with the form's message) and `DEFAULT_TOP_BOTTOM_PERCENT`; `roleDetailInput` uses both
- [x] `RoleDetailView` validates with `topBottomPercent` and starts from `DEFAULT_TOP_BOTTOM_PERCENT`
- [x] Page test: after an employee edit, going back to Insights never shows the old figures
- [x] Existing add, edit, delete and percentage tests pass unchanged

## Comments

- Plain invalidation would not have fixed the stale Insights figures: with the default `staleTime: 0` the unmounted Insights queries were already stale, and react-query still renders cached data while it refetches. Writes now remove cached `insights.*` instead, so the next visit shows a loader and then fresh figures.
- The canned tRPC link in `renderApp` answered synchronously, so the background refetch finished inside the same `act` and the stale render was invisible to tests. A canned response may now return a Promise to answer later; the new edit test uses that.
- Mantine's notification store is shared across tests in one file, so the new test waits for the drawer to close rather than for the "updated" notification.
- `topBottomPercent` gives its message for a cleared input too (`z.number({ error })`), not just for out-of-range numbers.
