import { List, Loader, SimpleGrid, Stack, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '../trpc';

export function EmployeesPage() {
  const trpc = useTRPC();
  const lookups = useQuery(trpc.lookups.all.queryOptions());

  return (
    <Stack>
      <Title order={2}>Employees</Title>
      {lookups.data ? (
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Stack gap="xs">
            <Title order={4}>Countries</Title>
            <List>
              {lookups.data.countries.map((c) => (
                <List.Item key={c.id}>{`${c.name} · ${c.currencyCode}`}</List.Item>
              ))}
            </List>
          </Stack>
          <Stack gap="xs">
            <Title order={4}>Roles</Title>
            <List>
              {lookups.data.roles.map((r) => (
                <List.Item key={r.id}>{`${r.name} · ${r.department.name}`}</List.Item>
              ))}
            </List>
          </Stack>
        </SimpleGrid>
      ) : (
        <Loader />
      )}
    </Stack>
  );
}
