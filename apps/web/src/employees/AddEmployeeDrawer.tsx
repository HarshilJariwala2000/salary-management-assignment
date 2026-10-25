import { Drawer } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '../trpc';
import { EmployeeForm } from './EmployeeForm';

export function AddEmployeeDrawer({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const create = useMutation(
    trpc.employees.create.mutationOptions({
      onSuccess: async (employee) => {
        notifications.show({ color: 'green', message: `${employee.fullName} added` });
        onClose();
        await queryClient.invalidateQueries({ queryKey: trpc.employees.list.queryKey() });
      },
    }),
  );

  return (
    <Drawer opened={opened} onClose={onClose} title="Add employee" position="right" size="md">
      <EmployeeForm submitLabel="Add employee" submitting={create.isPending} onSubmit={(draft) => create.mutate(draft)} />
    </Drawer>
  );
}
