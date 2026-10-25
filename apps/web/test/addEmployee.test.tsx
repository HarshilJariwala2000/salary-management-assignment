import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './support/renderApp';
import { lookups, twoEmployees } from './support/fixtures';

async function openAddEmployee(responses: Record<string, unknown> = {}) {
  const user = userEvent.setup();
  const app = renderApp({ 'lookups.all': lookups, 'employees.list': twoEmployees, ...responses });
  await user.click(await screen.findByRole('button', { name: 'Add employee' }));
  const form = await screen.findByRole('dialog', { name: 'Add employee' });
  // The dropdowns fill once lookups arrive, as a user would see.
  await within(form).findByRole('option', { name: 'Germany' });
  return { user, form, ...app };
}

describe('Add employee', () => {
  it('shows the currency of the chosen country and the department of the chosen role', async () => {
    const { user, form } = await openAddEmployee();

    await user.selectOptions(within(form).getByLabelText('Country'), 'Germany');
    await user.selectOptions(within(form).getByLabelText('Role'), 'Software Engineer');

    expect(within(form).getByLabelText('Currency')).toHaveValue('EUR');
    expect(within(form).getByLabelText('Department')).toHaveValue('Engineering');
  });

  it('shows each problem next to its field and sends nothing when the form is incomplete', async () => {
    const { user, form, calls } = await openAddEmployee();

    await user.type(within(form).getByLabelText('Email'), 'not-an-email');
    await user.click(within(form).getByRole('button', { name: 'Add employee' }));

    expect(within(form).getByLabelText('Full name')).toHaveAccessibleDescription('Name is required');
    expect(within(form).getByLabelText('Email')).toHaveAccessibleDescription('Enter a valid email');
    expect(within(form).getByLabelText('Country')).toHaveAccessibleDescription('Choose a country');
    expect(within(form).getByLabelText('Role')).toHaveAccessibleDescription('Choose a role');
    expect(within(form).getByLabelText('Joining date')).toHaveAccessibleDescription('Enter a valid date');
    expect(within(form).getByLabelText('Annual CTC')).toHaveAccessibleDescription('Enter the annual CTC');
    expect(calls.some((c) => c.path === 'employees.create')).toBe(false);
  });

  it('rejects a joining date in the future', async () => {
    const { user, form } = await openAddEmployee();

    await user.type(within(form).getByLabelText('Joining date'), '2999-01-01');
    await user.click(within(form).getByRole('button', { name: 'Add employee' }));

    expect(within(form).getByLabelText('Joining date')).toHaveAccessibleDescription('Joining date cannot be in the future');
  });
});
