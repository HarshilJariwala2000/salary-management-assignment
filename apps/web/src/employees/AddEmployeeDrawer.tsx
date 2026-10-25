import { Drawer } from '@mantine/core';
import { EmployeeForm } from './EmployeeForm';

export function AddEmployeeDrawer({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  return (
    <Drawer opened={opened} onClose={onClose} title="Add employee" position="right" size="md">
      <EmployeeForm submitLabel="Add employee" />
    </Drawer>
  );
}
