import { Drawer } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '../trpc';
import { EmployeeForm, type SubmitProblem } from './EmployeeForm';
import { toSubmitProblem } from './submitProblem';

export function AddEmployeeDrawer({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const create = useMutation(trpc.employees.create.mutationOptions());

  async function submit(draft: Parameters<typeof create.mutateAsync>[0]): Promise<SubmitProblem | void> {
    try {
      const employee = await create.mutateAsync(draft);
      notifications.show({ color: 'green', message: `${employee.fullName} added` });
      onClose();
      await queryClient.invalidateQueries({ queryKey: trpc.employees.list.queryKey() });
    } catch (error) {
      return toSubmitProblem(error);
    }
  }

  return (
    <Drawer opened={opened} onClose={onClose} title="Add employee" position="right" size="md">
      <EmployeeForm submitLabel="Add employee" submitting={create.isPending} onSubmit={submit} />
    </Drawer>
  );
}

