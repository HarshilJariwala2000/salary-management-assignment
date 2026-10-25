import { useState } from 'react';
import { ActionIcon, Button, Group, Loader, NativeSelect, Pagination, Stack, Table, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '@salary/shared';
import { AddEmployeeDrawer } from '../employees/AddEmployeeDrawer';
import { EditEmployeeDrawer } from '../employees/EditEmployeeDrawer';
import { formatDate, formatMoney } from '../format';
import { useTRPC } from '../trpc';

export function EmployeesPage() {
  const trpc = useTRPC();
  const [addOpened, addDrawer] = useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(DEFAULT_PAGE_SIZE);
  const employees = useQuery({
    ...trpc.employees.list.queryOptions({ page, pageSize }),
    placeholderData: keepPreviousData,
  });
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
