import { Drawer } from '@mantine/core';
import type { EmployeeDraft } from '@salary/shared';
import { EmployeeForm, type SubmitProblem } from './EmployeeForm';
import { useEmployeeWrites } from './useEmployeeWrites';

export function AddEmployeeDrawer({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const writes = useEmployeeWrites();

  async function submit(draft: EmployeeDraft): Promise<SubmitProblem | void> {
    const problem = await writes.create(draft);
    if (problem) return problem;
    onClose();
  }

  return (
    <Drawer opened={opened} onClose={onClose} title="Add employee" position="right" size="md">
      <EmployeeForm submitLabel="Add employee" submitting={writes.creating} onSubmit={submit} />
    </Drawer>
  );
}
