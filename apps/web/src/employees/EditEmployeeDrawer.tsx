import { Drawer, Loader } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import type { EmployeeDraft } from '@salary/shared';
import { useTRPC } from '../trpc';
import { EmployeeForm, type EmployeeFormValues, type SubmitProblem } from './EmployeeForm';
import { useEmployeeWrites } from './useEmployeeWrites';

/** Edits one employee, loading their current values first. employeeId null = closed. */
export function EditEmployeeDrawer({ employeeId, onClose }: { employeeId: number | null; onClose: () => void }) {
  const trpc = useTRPC();
  const employee = useQuery({
    ...trpc.employees.get.queryOptions({ id: employeeId ?? 0 }),
    enabled: employeeId !== null,
  });
  const writes = useEmployeeWrites();

  async function submit(draft: EmployeeDraft): Promise<SubmitProblem | void> {
    if (employeeId === null) return;
    const problem = await writes.update(employeeId, draft);
    if (problem) return problem;
    onClose();
  }

  return (
    <Drawer opened={employeeId !== null} onClose={onClose} title="Edit employee" position="right" size="md">
      {employee.data ? (
        <EmployeeForm
          key={employee.data.id}
          submitLabel="Save changes"
          initialValues={toFormValues(employee.data)}
          submitting={writes.updating}
          onSubmit={submit}
        />
      ) : (
        <Loader />
      )}
    </Drawer>
  );
}

function toFormValues(employee: {
  fullName: string;
  email: string;
  joiningDate: string;
  annualCtc: number;
  country: { id: number };
  role: { id: number };
}): EmployeeFormValues {
  return {
    fullName: employee.fullName,
    email: employee.email,
    countryId: String(employee.country.id),
    roleId: String(employee.role.id),
    joiningDate: employee.joiningDate,
    annualCtc: employee.annualCtc,
  };
}
