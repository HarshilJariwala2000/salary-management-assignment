import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiError, renderApp } from './support/renderApp';
import { indiaOverview, lookups, twoEmployees } from './support/fixtures';

async function openEditFor(name: string, responses: Record<string, unknown> = {}) {
  const user = userEvent.setup();
  const app = renderApp({
    'lookups.all': lookups,
    'employees.list': twoEmployees,
    'employees.get': ({ id }: { id: number }) => twoEmployees.rows.find((r) => r.id === id),
    ...responses,
  });
  await user.click(await screen.findByRole('button', { name: `Edit ${name}` }));
  const form = await screen.findByRole('dialog', { name: 'Edit employee' });
  await waitFor(() => expect(within(form).getByLabelText('Full name')).toHaveValue(name));
  return { user, form, ...app };
}

describe('Edit employee', () => {
  it('opens the employee’s current values from the row’s edit button', async () => {
    const { form } = await openEditFor('Asha Rao');

    expect(within(form).getByLabelText('Email')).toHaveValue('asha.rao@acme.test');
    expect(within(form).getByLabelText('Country')).toHaveDisplayValue('India');
    expect(within(form).getByLabelText('Currency')).toHaveValue('INR');
    expect(within(form).getByLabelText('Role')).toHaveDisplayValue('Recruiter');
    expect(within(form).getByLabelText('Department')).toHaveValue('People');
    expect(within(form).getByLabelText('Joining date')).toHaveValue('2023-04-01');
    expect(within(form).getByLabelText('Annual CTC')).toHaveValue('1,200,000');
  });

  it('saves the change with the employee’s id, confirms, closes and refreshes the list', async () => {
    const { user, form, calls } = await openEditFor('Asha Rao', {
      'employees.update': (input: { annualCtc: number }) => ({ ...twoEmployees.rows[0], annualCtc: input.annualCtc }),
    });
    const listCallsBefore = calls.filter((c) => c.path === 'employees.list').length;

    await user.clear(within(form).getByLabelText('Annual CTC'));
    await user.type(within(form).getByLabelText('Annual CTC'), '1300000');
    await user.click(within(form).getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(calls.find((c) => c.path === 'employees.update')?.input).toEqual({
        id: 1,
        fullName: 'Asha Rao',
        email: 'asha.rao@acme.test',
        countryId: 1,
        roleId: 15,
        joiningDate: '2023-04-01',
        annualCtc: 1_300_000,
      }),
    );
    expect(await screen.findByText('Asha Rao updated')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit employee' })).not.toBeInTheDocument());
    await waitFor(() => expect(calls.filter((c) => c.path === 'employees.list').length).toBeGreaterThan(listCallsBefore));
  });

  it('never shows Insights figures from before the edit', async () => {
    const user = userEvent.setup();
    let recruiterHeadcount = 2;
    renderApp({
      'lookups.all': lookups,
      'employees.list': twoEmployees,
      'employees.get': ({ id }: { id: number }) => twoEmployees.rows.find((r) => r.id === id),
      'employees.update': () => {
        recruiterHeadcount = 3;
        return twoEmployees.rows[0];
      },
      'insights.countryOverview': () => {
        const overview = {
          ...indiaOverview,
          roles: indiaOverview.roles.map((r) =>
            r.role.name === 'Recruiter' ? { ...r, summary: { ...r.summary, headcount: recruiterHeadcount } } : r,
          ),
        };
        // After the edit, answer slowly so anything cached would be on screen first.
        return recruiterHeadcount === 2 ? overview : new Promise((resolve) => setTimeout(() => resolve(overview), 100));
      },
    });
    const headcountOfRecruiters = async () =>
      within(await screen.findByRole('row', { name: /Recruiter/ })).getAllByRole('cell')[2]!.textContent;
    const showIndiaInsights = async () => {
      await user.click(screen.getByRole('button', { name: 'Insights' }));
      await user.selectOptions(await screen.findByLabelText('Country'), 'India');
    };

    await screen.findByRole('button', { name: 'Edit Asha Rao' });
    await showIndiaInsights();
    expect(await headcountOfRecruiters()).toBe('2');

    await user.click(screen.getByRole('button', { name: 'Employees' }));
    await user.click(await screen.findByRole('button', { name: 'Edit Asha Rao' }));
    const form = await screen.findByRole('dialog', { name: 'Edit employee' });
    await waitFor(() => expect(within(form).getByLabelText('Full name')).toHaveValue('Asha Rao'));
    await user.click(within(form).getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit employee' })).not.toBeInTheDocument());

    await showIndiaInsights();
    expect(await headcountOfRecruiters()).toBe('3');
  });

  it('shows a duplicate email from the server next to the email field', async () => {
    const { user, form } = await openEditFor('Asha Rao', {
      'employees.update': apiError('CONFLICT', 'Another employee already has this email', 'email'),
    });

    await user.click(within(form).getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(within(form).getByLabelText('Email')).toHaveAccessibleDescription('Another employee already has this email'),
    );
  });
});
