import { screen } from '@testing-library/react';
import { renderApp } from './support/renderApp';
import { lookups } from './support/fixtures';

describe('App', () => {
  it('shows Employees and Insights in the navigation', () => {
    renderApp({ 'lookups.all': lookups });

    expect(screen.getByRole('button', { name: 'Employees' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Insights' })).toBeInTheDocument();
  });

  it('opens on the Employees page, listing the countries and roles from the API', async () => {
    renderApp({ 'lookups.all': lookups });

    expect(await screen.findByText('India · INR')).toBeInTheDocument();
    expect(screen.getByText('Germany · EUR')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer · Engineering')).toBeInTheDocument();
  });
});
