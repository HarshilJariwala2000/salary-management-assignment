import { useState } from 'react';
import { ActionIcon, Button, Group, Loader, NativeSelect, Pagination, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '@salary/shared';
import { AddEmployeeDrawer } from '../employees/AddEmployeeDrawer';
import { EditEmployeeDrawer } from '../employees/EditEmployeeDrawer';
import { formatDate, formatMoney } from '../format';
import { useTRPC } from '../trpc';

interface Filters {
  countryId?: number;
  roleId?: number;
  departmentId?: number;
}

/** A filter dropdown whose first option, "All …", means no filter. */
function FilterSelect({
  label,
  allLabel,
  options,
  value,
  onChange,
}: {
  label: string;
  allLabel: string;
  options: { id: number; name: string }[];
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <NativeSelect
      label={label}
      data={[{ value: '', label: allLabel }, ...options.map((o) => ({ value: String(o.id), label: o.name }))]}
      value={value === undefined ? '' : String(value)}
      onChange={(event) => onChange(event.currentTarget.value ? Number(event.currentTarget.value) : undefined)}
    />
  );
}

export function EmployeesPage() {
  const trpc = useTRPC();
  const [addOpened, addDrawer] = useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  // Wait for a pause in typing before asking the API.
  const [debouncedSearch] = useDebouncedValue(search.trim(), 250);
  const [filters, setFilters] = useState<Filters>({});
  const lookups = useQuery(trpc.lookups.all.queryOptions());
  const employees = useQuery({
    ...trpc.employees.list.queryOptions({
      page,
      pageSize,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...filters,
    }),
    placeholderData: keepPreviousData,
  });
  function setFilter(change: Filters) {
    // Drop cleared filters so the request only carries the ones in use.
    setFilters((current) =>
      Object.fromEntries(Object.entries({ ...current, ...change }).filter(([, v]) => v !== undefined)),
    );
    setPage(1);
  }
  const totalPages = employees.data ? Math.max(1, Math.ceil(employees.data.total / pageSize)) : 1;

  return (
    <Stack>
      <Group justify="space-between">
        <Group gap="sm">
          <Title order={2}>Employees</Title>
          {employees.data && <Text c="dimmed">{`${employees.data.total.toLocaleString('en-US')} employees`}</Text>}
        </Group>
        <Button onClick={addDrawer.open}>Add employee</Button>
      </Group>
      <Group align="flex-end">
        <TextInput
          label="Search name or email"
          placeholder="e.g. asha or @acme.test"
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            setPage(1);
          }}
          w={260}
        />
        <FilterSelect
          label="Filter by country"
          allLabel="All countries"
          options={lookups.data?.countries ?? []}
          value={filters.countryId}
          onChange={(countryId) => setFilter({ countryId })}
        />
        <FilterSelect
          label="Filter by role"
          allLabel="All roles"
          options={lookups.data?.roles ?? []}
          value={filters.roleId}
          onChange={(roleId) => setFilter({ roleId })}
        />
        <FilterSelect
          label="Filter by department"
          allLabel="All departments"
          options={lookups.data?.departments ?? []}
          value={filters.departmentId}
          onChange={(departmentId) => setFilter({ departmentId })}
        />
      </Group>
      <AddEmployeeDrawer opened={addOpened} onClose={addDrawer.close} />
      <EditEmployeeDrawer employeeId={editingId} onClose={() => setEditingId(null)} />
      {employees.data ? (
        <Table.ScrollContainer minWidth={900}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Country</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Department</Table.Th>
                <Table.Th>Joined</Table.Th>
                <Table.Th ta="right">Annual CTC</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {employees.data.rows.map((e) => (
                <Table.Tr key={e.id}>
                  <Table.Td>{e.fullName}</Table.Td>
                  <Table.Td>{e.email}</Table.Td>
                  <Table.Td>{e.country.name}</Table.Td>
                  <Table.Td>{e.role.name}</Table.Td>
                  <Table.Td>{e.department.name}</Table.Td>
                  <Table.Td>{formatDate(e.joiningDate)}</Table.Td>
                  <Table.Td ta="right">{formatMoney(e.annualCtc, e.country.currencyCode)}</Table.Td>
                  <Table.Td>
                    <ActionIcon variant="subtle" aria-label={`Edit ${e.fullName}`} onClick={() => setEditingId(e.id)}>
                      ✎
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      ) : (
        <Loader />
      )}
      <Group justify="space-between">
        <NativeSelect
          label="Rows per page"
          data={PAGE_SIZES.map(String)}
          value={String(pageSize)}
          onChange={(event) => {
            setPageSize(Number(event.currentTarget.value) as (typeof PAGE_SIZES)[number]);
            setPage(1);
          }}
          w={140}
        />
        <Pagination total={totalPages} value={page} onChange={setPage} />
      </Group>
    </Stack>
  );
}
