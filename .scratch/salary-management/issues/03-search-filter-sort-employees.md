# 03: Search, filter and sort the employee list

**What to build:** HR narrows the employee list by searching name or email (ignoring case) and by filtering on country, role and department, in any combination. They can sort by name or joining date, and by salary once a country is selected, so ₹ and $ amounts are never ranked together.

**Blocked by:** 02 (Browse employees)

**Status:** ready-for-agent

- [ ] Search: a substring match on name or email that ignores case
- [ ] Country, role and department filters, combinable with each other and with search
- [ ] Sort by name, joining date or annual CTC, ascending or descending
- [ ] The API rejects sorting by annual CTC without a country filter (shared schema validation)
- [ ] In the UI, salary sort is disabled with a short explanation until a country is selected
- [ ] Changing search, a filter or the sort returns to page 1
- [ ] An empty state is shown when nothing matches
- [ ] Router tests: search, each filter, combined filters, each sort, and rejection of salary sort without a country
- [ ] Page test: salary sort is disabled until a country filter is set
