import { Button, Card, Group, Loader, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { useQuery } from '@tanstack/react-query';
import { formatMoney } from '../format';
import { useTRPC } from '../trpc';

/** One pay group: its summary, salary distribution (with the median marked) and a way back. */
export function RoleDetailView({
  countryId,
  roleId,
  countryName,
  onBack,
}: {
  countryId: number;
  roleId: number;
  countryName: string;
  onBack: () => void;
}) {
  const trpc = useTRPC();
  const detail = useQuery(trpc.insights.roleDetail.queryOptions({ countryId, roleId }));

  const back = (
    <Button variant="subtle" onClick={onBack} w="fit-content">
      {`Back to all roles in ${countryName}`}
    </Button>
  );
  if (detail.isError) {
    return (
      <Stack>
        {back}
        <Text c="dimmed">{`No employees in this role in ${countryName} any more`}</Text>
      </Stack>
    );
  }
  if (!detail.data) return <Stack>{back}<Loader /></Stack>;

  const { role, department, country, summary, histogram } = detail.data;
  const money = (amount: number) => formatMoney(amount, country.currencyCode);
  const buckets = histogram.map((b) => ({ ...b, range: `${money(b.lower)} – ${money(b.upper)}` }));
  const medianBucket = buckets.find((b, i) => summary.median < b.upper || i === buckets.length - 1)!;

  return (
    <Stack>
      {back}
      <Group gap="xs" align="baseline">
        <Title order={2}>{`${role.name} in ${country.name}`}</Title>
        <Text c="dimmed">{department.name}</Text>
      </Group>
      <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }}>
        {[
          ['Headcount', String(summary.headcount)],
          ['Min', money(summary.min)],
          ['Max', money(summary.max)],
          ['Average', money(summary.average)],
          ['Median', money(summary.median)],
          ['Spread', `${money(summary.spreadAmount)} (${summary.spreadRatio}×)`],
        ].map(([label, value]) => (
          <Card key={label} withBorder padding="sm">
            <Text size="xs" c="dimmed">
              {label}
            </Text>
            <Text fw={600}>{value}</Text>
          </Card>
        ))}
      </SimpleGrid>
      <Text fw={600}>{`Median ${money(summary.median)}`}</Text>
      {/* Decorative: the table below carries the same data for screen readers and tests. */}
      <div aria-hidden>
        <BarChart
          h={260}
          data={buckets}
          dataKey="range"
          series={[{ name: 'count', label: 'Employees', color: 'blue.6' }]}
          referenceLines={[{ x: medianBucket.range, label: 'Median', color: 'red.6' }]}
          tickLine="y"
        />
      </div>
      <Table striped>
        <Table.Caption>Salary distribution</Table.Caption>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Annual CTC</Table.Th>
            <Table.Th ta="right">Employees</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {buckets.map((b) => (
            <Table.Tr key={b.range}>
              <Table.Td>{b.range}</Table.Td>
              <Table.Td ta="right">{String(b.count)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
