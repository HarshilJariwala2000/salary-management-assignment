import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiError, renderApp } from './support/renderApp';
import { employeeRow, lookups, twoEmployees } from './support/fixtures';

async function openAddEmployee(responses: Record<string, unknown> = {}) {
  const user = userEvent.setup();
  const app = renderApp({ 'lookups.all': lookups, 'employees.list': twoEmployees, ...responses });
  await user.click(await screen.findByRole('button', { name: 'Add employee' }));
  const form = await screen.findByRole('dialog', { name: 'Add employee' });
  // The dropdowns fill once lookups arrive, as a user would see.
  await within(form).findByRole('option', { name: 'Germany' });
  return { user, form, ...app };
}

async function fillValidEmployee(user: ReturnType<typeof userEvent.setup>, form: HTMLElement) {
  await user.type(within(form).getByLabelText('Full name'), 'Asha Rao');
  await user.type(within(form).getByLabelText('Email'), ' Asha.Rao@ACME.test');
  await user.selectOptions(within(form).getByLabelText('Country'), 'India');
  await user.selectOptions(within(form).getByLabelText('Role'), 'Software Engineer');
  await user.type(within(form).getByLabelText('Joining date'), '2024-01-15');
  await user.type(within(form).getByLabelText('Annual CTC'), '1200000');
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

  it('creates the employee, closes the form, confirms, and refreshes the list', async () => {
    const { user, form, calls } = await openAddEmployee({ 'employees.create': employeeRow({ id: 99 }) });
    const listCallsBefore = calls.filter((c) => c.path === 'employees.list').length;

    await fillValidEmployee(user, form);
    await user.click(within(form).getByRole('button', { name: 'Add employee' }));

    await waitFor(() =>
      expect(calls.find((c) => c.path === 'employees.create')?.input).toEqual({
        fullName: 'Asha Rao',
        email: 'asha.rao@acme.test',
        countryId: 1,
        roleId: 1,
        joiningDate: '2024-01-15',
        annualCtc: 1_200_000,
      }),
    );
    expect(await screen.findByText('Asha Rao added')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Add employee' })).not.toBeInTheDocument());
    await waitFor(() => expect(calls.filter((c) => c.path === 'employees.list').length).toBeGreaterThan(listCallsBefore));
  });

  it('shows a problem the server finds, such as a duplicate email, next to its field', async () => {
    const { user, form } = await openAddEmployee({
      'employees.create': apiError('CONFLICT', 'Another employee already has this email', 'email'),
    });

    await fillValidEmployee(user, form);
    await user.click(within(form).getByRole('button', { name: 'Add employee' }));

    await waitFor(() =>
      expect(within(form).getByLabelText('Email')).toHaveAccessibleDescription('Another employee already has this email'),
    );
    expect(screen.getByRole('dialog', { name: 'Add employee' })).toBeInTheDocument();
  });

  it('says the employee was not saved when the server fails for another reason, keeping what was typed', async () => {
    const { user, form } = await openAddEmployee({
      'employees.create': apiError('INTERNAL_SERVER_ERROR', 'Database is unavailable'),
    });

    await fillValidEmployee(user, form);
    await user.click(within(form).getByRole('button', { name: 'Add employee' }));

    expect(await within(form).findByRole('alert')).toHaveTextContent('Not saved: Database is unavailable');
    expect(within(form).getByLabelText('Full name')).toHaveValue('Asha Rao');
  });
});
