# 14: One employee-writes module, and the top/bottom % rule from the shared package

**What to build:** Two frontend deepenings from the architecture review. (1) Add, edit and delete share one module that saves, confirms, refreshes what the write made stale and reports problems; Insights never shows pay figures from before a write. (2) The role detail validates the top/bottom percentage with the shared schema instead of a hand-written copy of the rule.

**Blocked by:** none

**Status:** ready-for-agent

- [ ] `useEmployeeWrites()` in `apps/web/src/employees/` gives `create`, `update` and `remove`, each resolving to `SubmitProblem | void` and never throwing, plus a pending flag for each
- [ ] It shows the success notification ("<name> added / updated / deleted")
- [ ] After a write it invalidates `employees.*` and removes cached `insights.*`, so Insights shows a loader rather than old figures
- [ ] `submitProblem.ts` is folded into the module; `SubmitProblem` stays in `EmployeeForm.tsx`
- [ ] The drawers and the delete modal keep only their UI and close when no problem comes back; the modal keeps its "Not deleted: …" message in local state
- [ ] `@salary/shared` exports `topBottomPercent` (whole number 1–50, with the form's message) and `DEFAULT_TOP_BOTTOM_PERCENT`; `roleDetailInput` uses both
- [ ] `RoleDetailView` validates with `topBottomPercent` and starts from `DEFAULT_TOP_BOTTOM_PERCENT`
- [ ] Page test: after an employee edit, going back to Insights never shows the old figures
- [ ] Existing add, edit, delete and percentage tests pass unchanged

## Comments
