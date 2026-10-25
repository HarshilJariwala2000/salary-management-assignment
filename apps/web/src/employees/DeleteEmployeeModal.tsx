import { Alert, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '../trpc';

/** Confirms a permanent delete, naming the employee so HR can't remove the wrong person. */
export function DeleteEmployeeModal({
  employee,
  onClose,
}: {
  employee: { id: number; fullName: string } | null;
  onClose: () => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const remove = useMutation(trpc.employees.delete.mutationOptions());

  function close() {
    remove.reset();
    onClose();
  }

  async function confirm() {
    if (!employee) return;
    try {
      await remove.mutateAsync({ id: employee.id });
    } catch {
      return; // remove.error is shown in the dialog
    }
    notifications.show({ color: 'green', message: `${employee.fullName} deleted` });
    close();
    await queryClient.invalidateQueries({ queryKey: trpc.employees.list.queryKey() });
  }

  return (
    <Modal opened={employee !== null} onClose={close} title="Delete employee" centered>
      <Stack>
        {remove.error && (
          <Alert color="red" role="alert">
            {`Not deleted: ${remove.error.message}`}
          </Alert>
        )}
        <Text>{`Delete ${employee?.fullName}? This cannot be undone.`}</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button color="red" loading={remove.isPending} onClick={confirm}>
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
