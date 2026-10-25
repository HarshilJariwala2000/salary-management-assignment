import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './support/renderApp';
import { lookups, twoEmployees } from './support/fixtures';

async function askToDelete(name: string, responses: Record<string, unknown> = {}) {
  const user = userEvent.setup();
  const app = renderApp({ 'lookups.all': lookups, 'employees.list': twoEmployees, ...responses });
  await user.click(await screen.findByRole('button', { name: `Delete ${name}` }));
  const dialog = await screen.findByRole('dialog', { name: 'Delete employee' });
  return { user, dialog, ...app };
}

describe('Delete employee', () => {
  it('asks for confirmation naming the employee, and sends nothing on cancel', async () => {
    const { user, dialog, calls } = await askToDelete('Asha Rao');

    expect(dialog).toHaveTextContent('Delete Asha Rao? This cannot be undone.');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Delete employee' })).not.toBeInTheDocument());
    expect(calls.some((c) => c.path === 'employees.delete')).toBe(false);
  });
});
