import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiError, renderApp, type ApiCall } from './support/renderApp';
import { indiaOverview, indiaRecruiterDetail, lookups, twoEmployees } from './support/fixtures';

const lastRoleDetailInput = (calls: ApiCall[]) => calls.filter((c) => c.path === 'insights.roleDetail').at(-1)?.input;
const cells = (table: HTMLElement) =>
  within(table)
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell').map((cell) => cell.textContent));

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
    expect(calls.find((c) => c.path === 'insights.roleDetail')?.input).toMatchObject({ countryId: 1, roleId: 15 });
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

  it('lists the top and bottom earners against the median, and asks again for a new percentage', async () => {
    const { user, calls } = await openInsights();
    await user.selectOptions(screen.getByLabelText('Country'), 'India');
    await user.click(await screen.findByRole('button', { name: 'Recruiter' }));

    const top = await screen.findByRole('table', { name: 'Top 10% earners' });
    expect(cells(top)).toEqual([['Esha Nair', '₹9,00,000', '+₹50,000', '01 Jul 2019']]);
    expect(cells(screen.getByRole('table', { name: 'Bottom 10% earners' }))).toEqual([
      ['Dev Shah', '₹8,00,000', '−₹50,000', '14 Feb 2022'],
    ]);
    expect(lastRoleDetailInput(calls)).toEqual({ countryId: 1, roleId: 15, percent: 10 });

    const percent = screen.getByLabelText('Top and bottom %');
    await user.clear(percent);
    await user.type(percent, '25');

    await waitFor(() => expect(lastRoleDetailInput(calls)).toEqual({ countryId: 1, roleId: 15, percent: 25 }));
    expect(await screen.findByRole('table', { name: 'Top 25% earners' })).toBeInTheDocument();
  });

  it('rejects a percentage outside 1–50 without asking the API, keeping the last lists', async () => {
    const { user, calls } = await openInsights();
    await user.selectOptions(screen.getByLabelText('Country'), 'India');
    await user.click(await screen.findByRole('button', { name: 'Recruiter' }));
    await screen.findByRole('table', { name: 'Top 10% earners' });

    const percent = screen.getByLabelText('Top and bottom %');
    await user.clear(percent);
    await user.type(percent, '60');

    expect(percent).toHaveAccessibleDescription(/Enter a whole number from 1 to 50/);
    expect(calls.some((c) => c.path === 'insights.roleDetail' && (c.input as { percent: number }).percent === 60)).toBe(false);
    expect(screen.getByRole('table', { name: 'Top 6% earners' })).toBeInTheDocument();
  });

  it('explains why a role with one employee lists that person at both ends', async () => {
    const only = { id: 30, fullName: 'Gita Bose', annualCtc: 2_500_000, joiningDate: '2021-05-10', differenceFromMedian: 0 };
    const { user } = await openInsights({
      'insights.roleDetail': {
        ...indiaRecruiterDetail,
        summary: { ...indiaRecruiterDetail.summary, headcount: 1 },
        bottom: [only],
        top: [only],
      },
    });
    await user.selectOptions(screen.getByLabelText('Country'), 'India');
    await user.click(await screen.findByRole('button', { name: 'Recruiter' }));

    expect(await screen.findByText('Only one employee in this role, so they appear in both lists')).toBeInTheDocument();
  });
});
