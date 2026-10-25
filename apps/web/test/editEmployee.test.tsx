import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './support/renderApp';
import { lookups, twoEmployees } from './support/fixtures';

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
});
