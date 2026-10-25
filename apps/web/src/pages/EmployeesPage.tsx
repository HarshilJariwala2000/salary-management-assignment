import { Group, Loader, Stack, Table, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { formatDate, formatMoney } from '../format';
import { useTRPC } from '../trpc';

export function EmployeesPage() {
  const trpc = useTRPC();
  const employees = useQuery(trpc.employees.list.queryOptions({}));

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Employees</Title>
        {employees.data && <Text c="dimmed">{`${employees.data.total.toLocaleString('en-US')} employees`}</Text>}
      </Group>
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
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      ) : (
        <Loader />
      )}
    </Stack>
  );
}
