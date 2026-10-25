# Clarifications

The assessment brief was intentionally open-ended, so I sent the assessment team my proposed assumptions before building anything. Below are my questions, the assumption I proposed for each, and the answer I got (paraphrased).

| # | Question | My proposed assumption | Answer |
|---|---|---|---|
| 1 | Salaries are made up of different parts that vary by country. Do we store the breakdown, or just the total? | Store **annual CTC** only. | Confirmed. This keeps the MVP focused and avoids over-engineering. |
| 2 | Which insights does HR need from the app? | Within a country, per role: **min, max, average and median salary**, the **pay spread** (max − min), and the **employees at the low and high ends** of the role's pay range. | Confirmed. These directly answer how the organization pays people. |
| 3 | Do we track how salaries change over time? | Store the **current salary only**. | Acceptable for the MVP, as long as leaving out history is documented. |
| 4 | Which employee fields should be stored? | id, name, email, country, joining date, salary, job role, department, currency. | Confirmed. These cover what a functional system needs. |
| 5 | Are salaries stored in each country's local currency? | Yes. **Currency is derived from the country** (e.g. India → INR). | Confirmed as a clean approach. |

The team also asked that these choices, and everything deliberately left out, be documented in the requirements before building. See [requirements.md](requirements.md).

## Decisions I made after the clarifications

Within the scope the team confirmed, I refined these myself:

- **Top/bottom x% earners per pay group** (one country + one role) replaces the vaguer "employees at the low and high ends". x is a whole number from 1 to 50, the list size is x% rounded up with a minimum of 1, and equal salaries are ordered by employee ID so results never change between runs.
- **Department is derived from job role.** Each role belongs to exactly one department, so the two can never disagree. This narrows answer 4: department is shown but never entered.
- **Every pay figure stays within one country.** This follows from answer 5: averaging different currencies is meaningless.
- **Choice of page size** (10 / 20 / 50 / 100) on the employee list.
- **Top/bottom by a fixed number of employees** was considered and left out as scope creep (see [requirements.md](requirements.md)).
