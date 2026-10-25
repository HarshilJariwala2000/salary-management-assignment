import { Drawer, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EmployeeDraft } from '@salary/shared';
import { useTRPC } from '../trpc';
import { EmployeeForm, type EmployeeFormValues, type SubmitProblem } from './EmployeeForm';
import { toSubmitProblem } from './submitProblem';

/** Edits one employee, loading their current values first. employeeId null = closed. */
export function EditEmployeeDrawer({ employeeId, onClose }: { employeeId: number | null; onClose: () => void }) {
  const trpc = useTRPC();
  const employee = useQuery({
    ...trpc.employees.get.queryOptions({ id: employeeId ?? 0 }),
    enabled: employeeId !== null,
  });
  const queryClient = useQueryClient();
  const update = useMutation(trpc.employees.update.mutationOptions());

  async function submit(draft: EmployeeDraft): Promise<SubmitProblem | void> {
    if (employeeId === null) return;
    try {
      const saved = await update.mutateAsync({ id: employeeId, ...draft });
      notifications.show({ color: 'green', message: `${saved.fullName} updated` });
      onClose();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: trpc.employees.list.queryKey() }),
        queryClient.invalidateQueries({ queryKey: trpc.employees.get.queryKey({ id: employeeId }) }),
      ]);
    } catch (error) {
      return toSubmitProblem(error);
    }
  }

  return (
    <Drawer opened={employeeId !== null} onClose={onClose} title="Edit employee" position="right" size="md">
      {employee.data ? (
        <EmployeeForm
          key={employee.data.id}
          submitLabel="Save changes"
          initialValues={toFormValues(employee.data)}
          submitting={update.isPending}
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
