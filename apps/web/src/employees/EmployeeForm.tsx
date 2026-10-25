import { Button, Group, NativeSelect, NumberInput, SimpleGrid, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '../trpc';

export interface EmployeeFormValues {
  fullName: string;
  email: string;
  countryId: string;
  roleId: string;
  joiningDate: string;
  annualCtc: number | '';
}

const emptyValues: EmployeeFormValues = {
  fullName: '',
  email: '',
  countryId: '',
  roleId: '',
  joiningDate: '',
  annualCtc: '',
};

/** The employee fields. Department and currency are shown read-only, derived from role and country. */
export function EmployeeForm({ submitLabel }: { submitLabel: string }) {
  const trpc = useTRPC();
  const lookups = useQuery(trpc.lookups.all.queryOptions());
  const form = useForm<EmployeeFormValues>({ initialValues: emptyValues });

  const country = lookups.data?.countries.find((c) => String(c.id) === form.values.countryId);
  const role = lookups.data?.roles.find((r) => String(r.id) === form.values.roleId);

  return (
    <form>
      <Stack>
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
          <Button type="submit">{submitLabel}</Button>
        </Group>
      </Stack>
    </form>
  );
}
