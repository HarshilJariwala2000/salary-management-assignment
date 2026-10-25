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
    await waitFor(() => expect(lastListInput(calls)).toEqual({ page: 2, pageSize: 20 }));

    await user.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '50');
    await waitFor(() => expect(lastListInput(calls)).toEqual({ page: 1, pageSize: 50 }));
  });
});
