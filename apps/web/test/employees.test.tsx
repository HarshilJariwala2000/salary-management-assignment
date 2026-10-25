import { screen, within } from '@testing-library/react';
import { renderApp } from './support/renderApp';
import { lookups, twoEmployees } from './support/fixtures';

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
});
