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
});
