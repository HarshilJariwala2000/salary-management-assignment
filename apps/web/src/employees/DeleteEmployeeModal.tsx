import { useState } from 'react';
import { Alert, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useEmployeeWrites } from './useEmployeeWrites';

/** Confirms a permanent delete, naming the employee so HR can't remove the wrong person. */
export function DeleteEmployeeModal({
  employee,
  onClose,
}: {
  employee: { id: number; fullName: string } | null;
  onClose: () => void;
}) {
  const writes = useEmployeeWrites();
  const [failure, setFailure] = useState<string | null>(null);

  function close() {
    setFailure(null);
    onClose();
  }

  async function confirm() {
    if (!employee) return;
    const problem = await writes.remove(employee);
    if (problem) setFailure(problem.message);
    else close();
  }

  return (
    <Modal opened={employee !== null} onClose={close} title="Delete employee" centered>
      <Stack>
        {failure && (
          <Alert color="red" role="alert">
            {`Not deleted: ${failure}`}
          </Alert>
        )}
        <Text>{`Delete ${employee?.fullName}? This cannot be undone.`}</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button color="red" loading={writes.removing} onClick={confirm}>
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
