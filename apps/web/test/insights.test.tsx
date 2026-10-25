import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiError, renderApp } from './support/renderApp';
import { indiaOverview, indiaRecruiterDetail, lookups, twoEmployees } from './support/fixtures';

async function openInsights(responses: Record<string, unknown> = {}) {
  const user = userEvent.setup();
  const app = renderApp({
    'lookups.all': lookups,
    'employees.list': twoEmployees,
    'insights.countryOverview': indiaOverview,
    'insights.roleDetail': indiaRecruiterDetail,
    ...responses,
  });
  await user.click(await screen.findByRole('button', { name: 'Insights' }));
  await screen.findByRole('option', { name: 'India' });
  return { user, ...app };
}

describe('Insights page', () => {
  it('asks for a country, then shows each role’s pay in that country’s currency', async () => {
    const { user, calls } = await openInsights();
    expect(screen.getByText('Choose a country to see how it pays each role')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Country'), 'India');

    const recruiters = await screen.findByRole('row', { name: /Recruiter/ });
    expect(within(recruiters).getAllByRole('cell').map((c) => c.textContent)).toEqual([
      'Recruiter',
      'People',
      '2',
      '₹8,00,000',
      '₹9,00,000',
      '₹8,50,000',
      '₹8,50,000',
      '₹1,00,000',
      '1.13×',
    ]);
    expect(calls.find((c) => c.path === 'insights.countryOverview')?.input).toEqual({ countryId: 1 });
  });

  it('sorts roles by any column, ascending first, then descending', async () => {
    const { user } = await openInsights();
    await user.selectOptions(screen.getByLabelText('Country'), 'India');
    await screen.findByRole('row', { name: /Recruiter/ });
    const roleOrder = () =>
      screen
        .getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[0]!.textContent);

    expect(roleOrder()).toEqual(['Account Executive', 'Recruiter', 'Software Engineer']);

    await user.click(screen.getByRole('button', { name: 'Median' }));
    expect(roleOrder()).toEqual(['Recruiter', 'Software Engineer', 'Account Executive']);
    expect(screen.getByRole('columnheader', { name: 'Median' })).toHaveAttribute('aria-sort', 'ascending');

    await user.click(screen.getByRole('button', { name: 'Median' }));
    expect(roleOrder()).toEqual(['Account Executive', 'Software Engineer', 'Recruiter']);
    expect(screen.getByRole('columnheader', { name: 'Median' })).toHaveAttribute('aria-sort', 'descending');
  });

  it('opens a role’s pay detail with its salary distribution and median, then goes back', async () => {
    const { user, calls } = await openInsights();
    await user.selectOptions(screen.getByLabelText('Country'), 'India');

    await user.click(await screen.findByRole('button', { name: 'Recruiter' }));

    expect(await screen.findByRole('heading', { name: 'Recruiter in India' })).toBeInTheDocument();
    expect(calls.find((c) => c.path === 'insights.roleDetail')?.input).toEqual({ countryId: 1, roleId: 15 });
    expect(screen.getByText('Median ₹8,50,000')).toBeInTheDocument();
    const distribution = screen.getByRole('table', { name: 'Salary distribution' });
    const buckets = within(distribution)
      .getAllByRole('row')
      .slice(1)
      .map((row) => within(row).getAllByRole('cell').map((cell) => cell.textContent));
    expect(buckets[0]).toEqual(['₹8,00,000 – ₹8,10,000', '1']);
    expect(buckets[1]).toEqual(['₹8,10,000 – ₹8,20,000', '0']);
    expect(buckets[9]).toEqual(['₹8,90,000 – ₹9,00,000', '1']);

    await user.click(screen.getByRole('button', { name: 'Back to all roles in India' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Recruiter' })).toBeInTheDocument());
  });

  it('says so when the pay group has no employees any more', async () => {
    const { user } = await openInsights({ 'insights.roleDetail': apiError('NOT_FOUND', 'Pay group not found') });
    await user.selectOptions(screen.getByLabelText('Country'), 'India');

    await user.click(await screen.findByRole('button', { name: 'Recruiter' }));

    expect(await screen.findByText('No employees in this role in India any more')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to all roles in India' })).toBeInTheDocument();
  });
});
