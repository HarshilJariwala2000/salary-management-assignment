import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp, type ApiCall } from './support/renderApp';
import { employeeRow, lookups, twoEmployees } from './support/fixtures';

const lastListInput = (calls: ApiCall[]) => calls.filter((c) => c.path === 'employees.list').at(-1)?.input;

describe('Employees page', () => {
  it('shows employees with country, role, department, joining date and salary in local currency', async () => {
    renderApp({ 'lookups.all': lookups, 'employees.list': twoEmployees });

    const asha = await screen.findByRole('row', { name: /Asha Rao/ });
    for (const text of ['asha.rao@acme.test', 'India', 'Recruiter', 'People', '01 Apr 2023', '₹12,00,000']) {
      expect(within(asha).getByText(text)).toBeInTheDocument();
    }
    const ben = screen.getByRole('row', { name: /Ben Carter/ });
    expect(within(ben).getByText('$95,000')).toBeInTheDocument();
    expect(screen.getByText('2 employees')).toBeInTheDocument();
  });

  it('offers 10, 20, 50 and 100 rows per page, starting at 20', async () => {
    renderApp({ 'lookups.all': lookups, 'employees.list': twoEmployees });

    const pageSize = await screen.findByRole('combobox', { name: 'Rows per page' });

    expect(within(pageSize).getAllByRole('option').map((o) => o.textContent)).toEqual(['10', '20', '50', '100']);
    expect(pageSize).toHaveValue('20');
  });

  it('requests the chosen page, and goes back to page 1 when the page size changes', async () => {
    const user = userEvent.setup();
    const { calls } = renderApp({
      'lookups.all': lookups,
      'employees.list': { total: 45, rows: [employeeRow()] },
    });

    await user.click(await screen.findByRole('button', { name: '2' }));
    await waitFor(() => expect(lastListInput(calls)).toMatchObject({ page: 2, pageSize: 20 }));

    await user.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '50');
    await waitFor(() => expect(lastListInput(calls)).toMatchObject({ page: 1, pageSize: 50 }));
  });

  it('searches by name or email as HR types, starting again from page 1', async () => {
    const user = userEvent.setup();
    const { calls } = renderApp({ 'lookups.all': lookups, 'employees.list': { total: 45, rows: [employeeRow()] } });
    await user.click(await screen.findByRole('button', { name: '2' }));
    await waitFor(() => expect(lastListInput(calls)).toMatchObject({ page: 2 }));

    await user.type(screen.getByRole('textbox', { name: 'Search name or email' }), 'rao');

    await waitFor(() => expect(lastListInput(calls)).toMatchObject({ search: 'rao', page: 1 }));
  });

  it('filters by country, role and department, starting again from page 1', async () => {
    const user = userEvent.setup();
    const { calls } = renderApp({ 'lookups.all': lookups, 'employees.list': { total: 45, rows: [employeeRow()] } });
    await screen.findByRole('option', { name: 'India' });
    await user.click(screen.getByRole('button', { name: '2' }));

    await user.selectOptions(screen.getByLabelText('Filter by country'), 'India');
    await waitFor(() => expect(lastListInput(calls)).toMatchObject({ countryId: 1, page: 1 }));
    await user.selectOptions(screen.getByLabelText('Filter by role'), 'Recruiter');
    await waitFor(() => expect(lastListInput(calls)).toMatchObject({ countryId: 1, roleId: 15 }));
    await user.selectOptions(screen.getByLabelText('Filter by department'), 'People');
    await waitFor(() => expect(lastListInput(calls)).toMatchObject({ countryId: 1, roleId: 15, departmentId: 5 }));

    await user.selectOptions(screen.getByLabelText('Filter by country'), 'All countries');
    await waitFor(() => expect(lastListInput(calls)).not.toHaveProperty('countryId'));
  });

  it('sorts by salary only once a country is chosen, and drops that sort if the country is cleared', async () => {
    const user = userEvent.setup();
    const { calls } = renderApp({ 'lookups.all': lookups, 'employees.list': twoEmployees });
    await screen.findByRole('option', { name: 'India' });
    const sort = screen.getByLabelText('Sort by');

    await user.selectOptions(sort, 'Newest joiners');
    await waitFor(() => expect(lastListInput(calls)).toMatchObject({ sortBy: 'joiningDate', sortDirection: 'desc' }));
    expect(within(sort).getByRole('option', { name: 'Highest paid' })).toBeDisabled();
    expect(sort).toHaveAccessibleDescription('Choose a country to sort by salary');

    await user.selectOptions(screen.getByLabelText('Filter by country'), 'India');
    await user.selectOptions(sort, 'Highest paid');
    await waitFor(() =>
      expect(lastListInput(calls)).toMatchObject({ countryId: 1, sortBy: 'annualCtc', sortDirection: 'desc', page: 1 }),
    );

    await user.selectOptions(screen.getByLabelText('Filter by country'), 'All countries');
    await waitFor(() => expect(lastListInput(calls)).toMatchObject({ sortBy: 'name', sortDirection: 'asc' }));
    expect(sort).toHaveDisplayValue('Name (A–Z)');
  });
});
