import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiError, renderApp } from './support/renderApp';
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

  it('deletes on confirm, says so, closes, and refreshes the list', async () => {
    const { user, dialog, calls } = await askToDelete('Asha Rao', { 'employees.delete': { id: 1 } });
    const listCallsBefore = calls.filter((c) => c.path === 'employees.list').length;

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(calls.find((c) => c.path === 'employees.delete')?.input).toEqual({ id: 1 }));
    expect(await screen.findByText('Asha Rao deleted')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Delete employee' })).not.toBeInTheDocument());
    await waitFor(() => expect(calls.filter((c) => c.path === 'employees.list').length).toBeGreaterThan(listCallsBefore));
  });

  it('keeps the dialog open with the reason when the delete fails', async () => {
    const { user, dialog } = await askToDelete('Asha Rao', {
      'employees.delete': apiError('NOT_FOUND', 'Employee not found'),
    });

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Not deleted: Employee not found');
  });
});
