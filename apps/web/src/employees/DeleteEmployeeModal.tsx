import { Button, Group, Modal, Text } from '@mantine/core';

/** Confirms a permanent delete, naming the employee so HR can't remove the wrong person. */
export function DeleteEmployeeModal({
  employee,
  onClose,
}: {
  employee: { id: number; fullName: string } | null;
  onClose: () => void;
}) {
  return (
    <Modal opened={employee !== null} onClose={onClose} title="Delete employee" centered>
      <Text>{`Delete ${employee?.fullName}? This cannot be undone.`}</Text>
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button color="red">Delete</Button>
      </Group>
    </Modal>
  );
}
