import { screen } from '@testing-library/react';
import { renderApp } from './support/renderApp';
import { lookups, twoEmployees } from './support/fixtures';

describe('App', () => {
  it('shows Employees and Insights in the navigation', () => {
    renderApp({ 'lookups.all': lookups, 'employees.list': twoEmployees });

    expect(screen.getByRole('button', { name: 'Employees' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Insights' })).toBeInTheDocument();
  });

});
