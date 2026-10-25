import { useState } from 'react';
import { Loader, NativeSelect, Stack, Table, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { formatMoney } from '../format';
import { useTRPC } from '../trpc';

export function InsightsPage() {
  const trpc = useTRPC();
  const lookups = useQuery(trpc.lookups.all.queryOptions());
  const [countryId, setCountryId] = useState<number | null>(null);
  const overview = useQuery({
    ...trpc.insights.countryOverview.queryOptions({ countryId: countryId ?? 0 }),
    enabled: countryId !== null,
  });

  return (
    <Stack>
      <Title order={2}>Insights</Title>
      <NativeSelect
        label="Country"
        data={[
          { value: '', label: 'Select a country' },
          ...(lookups.data?.countries ?? []).map((c) => ({ value: String(c.id), label: c.name })),
        ]}
        value={countryId === null ? '' : String(countryId)}
        onChange={(event) => setCountryId(event.currentTarget.value ? Number(event.currentTarget.value) : null)}
        w={260}
      />
      {countryId === null ? (
        <Text c="dimmed">Choose a country to see how it pays each role</Text>
      ) : overview.data ? (
        <Table.ScrollContainer minWidth={900}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Role</Table.Th>
                <Table.Th>Department</Table.Th>
                <Table.Th ta="right">Headcount</Table.Th>
                <Table.Th ta="right">Min</Table.Th>
                <Table.Th ta="right">Max</Table.Th>
                <Table.Th ta="right">Average</Table.Th>
                <Table.Th ta="right">Median</Table.Th>
                <Table.Th ta="right">Spread</Table.Th>
                <Table.Th ta="right">Max ÷ min</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {overview.data.roles.map(({ role, department, summary }) => {
                const money = (amount: number) => formatMoney(amount, overview.data.country.currencyCode);
                return (
                  <Table.Tr key={role.id}>
                    <Table.Td>{role.name}</Table.Td>
                    <Table.Td>{department.name}</Table.Td>
                    <Table.Td ta="right">{summary.headcount}</Table.Td>
                    <Table.Td ta="right">{money(summary.min)}</Table.Td>
                    <Table.Td ta="right">{money(summary.max)}</Table.Td>
                    <Table.Td ta="right">{money(summary.average)}</Table.Td>
                    <Table.Td ta="right">{money(summary.median)}</Table.Td>
                    <Table.Td ta="right">{money(summary.spreadAmount)}</Table.Td>
                    <Table.Td ta="right">{`${summary.spreadRatio}×`}</Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      ) : (
        <Loader />
      )}
    </Stack>
  );
}
