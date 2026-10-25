import { useState } from 'react';
import { Alert, Button, Group, NativeSelect, NumberInput, SimpleGrid, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';
import { employeeInput, type EmployeeDraft } from '@salary/shared';
import { useTRPC } from '../trpc';

export interface EmployeeFormValues {
  fullName: string;
  email: string;
  countryId: string;
  roleId: string;
  joiningDate: string;
  annualCtc: number | '';
}

/** What a failed save reports back: a field to attach the message to, or none for a general failure. */
export interface SubmitProblem {
  field?: string;
  message: string;
}

const emptyValues: EmployeeFormValues = {
  fullName: '',
  email: '',
  countryId: '',
  roleId: '',
  joiningDate: '',
  annualCtc: '',
};

/** Local calendar date as YYYY-MM-DD ('en-CA' formats dates that way). */
const localToday = () => new Date().toLocaleDateString('en-CA');

function toCandidate(values: EmployeeFormValues) {
  return {
    ...values,
    countryId: Number(values.countryId) || 0,
    roleId: Number(values.roleId) || 0,
    annualCtc: values.annualCtc === '' ? undefined : values.annualCtc,
  };
}

/**
 * Same rules as the API: the shared schema, plus the not-in-the-future check
 * (the server applies it again against its own clock).
 */
function validate(values: EmployeeFormValues): Partial<Record<keyof EmployeeFormValues, string>> {
  const errors: Partial<Record<keyof EmployeeFormValues, string>> = {};
  const result = employeeInput.safeParse(toCandidate(values));
  for (const issue of result.success ? [] : result.error.issues) {
    const field = issue.path[0] as keyof EmployeeFormValues;
    errors[field] ??= issue.message;
  }
  if (!errors.joiningDate && values.joiningDate > localToday()) {
    errors.joiningDate = 'Joining date cannot be in the future';
  }
  return errors;
}

/** The employee fields. Department and currency are shown read-only, derived from role and country. */
export function EmployeeForm({
  submitLabel,
  initialValues = emptyValues,
  submitting = false,
  onSubmit = async () => {},
}: {
  submitLabel: string;
  initialValues?: EmployeeFormValues;
  submitting?: boolean;
  onSubmit?: (draft: EmployeeDraft) => Promise<SubmitProblem | void>;
}) {
  const trpc = useTRPC();
  const lookups = useQuery(trpc.lookups.all.queryOptions());
  const form = useForm<EmployeeFormValues>({ initialValues, validate });
  const [failure, setFailure] = useState<string | null>(null);

  async function submit(values: EmployeeFormValues) {
    setFailure(null);
    const problem = await onSubmit(employeeInput.parse(toCandidate(values)));
    if (!problem) return;
    if (problem.field && problem.field in emptyValues) form.setFieldError(problem.field, problem.message);
    else setFailure(problem.message);
  }

  const country = lookups.data?.countries.find((c) => String(c.id) === form.values.countryId);
  const role = lookups.data?.roles.find((r) => String(r.id) === form.values.roleId);

  return (
    <form onSubmit={form.onSubmit(submit)} noValidate>
      <Stack>
        {failure && (
          <Alert color="red" role="alert">
            {`Not saved: ${failure}`}
          </Alert>
        )}
        <TextInput label="Full name" {...form.getInputProps('fullName')} />
        <TextInput label="Email" {...form.getInputProps('email')} />
        <SimpleGrid cols={2}>
          <NativeSelect
            label="Country"
            data={[
              { value: '', label: 'Select a country' },
              ...(lookups.data?.countries ?? []).map((c) => ({ value: String(c.id), label: c.name })),
            ]}
            {...form.getInputProps('countryId')}
          />
          <TextInput label="Currency" value={country?.currencyCode ?? ''} readOnly />
          <NativeSelect
            label="Role"
            data={[
              { value: '', label: 'Select a role' },
              ...(lookups.data?.roles ?? []).map((r) => ({ value: String(r.id), label: r.name })),
            ]}
            {...form.getInputProps('roleId')}
          />
          <TextInput label="Department" value={role?.department.name ?? ''} readOnly />
        </SimpleGrid>
        <SimpleGrid cols={2}>
          <TextInput label="Joining date" type="date" {...form.getInputProps('joiningDate')} />
          <NumberInput label="Annual CTC" min={1} allowDecimal={false} thousandSeparator="," {...form.getInputProps('annualCtc')} />
        </SimpleGrid>
        <Group justify="flex-end">
          <Button type="submit" loading={submitting}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
