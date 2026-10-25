import { useState } from 'react';
import { Loader, NativeSelect, Stack, Table, Text, Title, UnstyledButton } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@salary/api';
import { formatMoney } from '../format';
import { useTRPC } from '../trpc';

type RoleOverview = inferRouterOutputs<AppRouter>['insights']['countryOverview']['roles'][number];

interface Column {
  key: string;
  label: string;
  value: (row: RoleOverview) => string | number;
  render: (row: RoleOverview, money: (amount: number) => string) => string;
  numeric?: boolean;
}

const columns: Column[] = [
  { key: 'role', label: 'Role', value: (r) => r.role.name, render: (r) => r.role.name },
  { key: 'department', label: 'Department', value: (r) => r.department.name, render: (r) => r.department.name },
  { key: 'headcount', label: 'Headcount', numeric: true, value: (r) => r.summary.headcount, render: (r) => String(r.summary.headcount) },
  { key: 'min', label: 'Min', numeric: true, value: (r) => r.summary.min, render: (r, money) => money(r.summary.min) },
  { key: 'max', label: 'Max', numeric: true, value: (r) => r.summary.max, render: (r, money) => money(r.summary.max) },
  { key: 'average', label: 'Average', numeric: true, value: (r) => r.summary.average, render: (r, money) => money(r.summary.average) },
  { key: 'median', label: 'Median', numeric: true, value: (r) => r.summary.median, render: (r, money) => money(r.summary.median) },
  {
    key: 'spreadAmount',
    label: 'Spread',
    numeric: true,
    value: (r) => r.summary.spreadAmount,
    render: (r, money) => money(r.summary.spreadAmount),
  },
  {
    key: 'spreadRatio',
    label: 'Max ÷ min',
    numeric: true,
    value: (r) => r.summary.spreadRatio,
    render: (r) => `${r.summary.spreadRatio}×`,
  },
];

type Direction = 'ascending' | 'descending';

/** Sorting a handful of rows already on screen is presentation, so it happens here, not in SQL. */
function sortRows(rows: RoleOverview[], column: Column, direction: Direction): RoleOverview[] {
  const sign = direction === 'ascending' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const [x, y] = [column.value(a), column.value(b)];
    return sign * (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y)));
  });
}

export function InsightsPage() {
  const trpc = useTRPC();
  const lookups = useQuery(trpc.lookups.all.queryOptions());
  const [countryId, setCountryId] = useState<number | null>(null);
  const [sort, setSort] = useState<{ key: string; direction: Direction }>({ key: 'role', direction: 'ascending' });
  const overview = useQuery({
    ...trpc.insights.countryOverview.queryOptions({ countryId: countryId ?? 0 }),
    enabled: countryId !== null,
  });

  function toggleSort(key: string) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'ascending' ? 'descending' : 'ascending' }
        : { key, direction: 'ascending' },
    );
  }

  const sortColumn = columns.find((c) => c.key === sort.key)!;

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
                {columns.map((column) => (
                  <Table.Th
                    key={column.key}
                    ta={column.numeric ? 'right' : undefined}
                    aria-sort={sort.key === column.key ? sort.direction : 'none'}
                  >
                    <UnstyledButton fw={600} onClick={() => toggleSort(column.key)}>
                      {column.label}
                      {sort.key === column.key && <span aria-hidden>{sort.direction === 'ascending' ? ' ▲' : ' ▼'}</span>}
                    </UnstyledButton>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortRows(overview.data.roles, sortColumn, sort.direction).map((row) => {
                const money = (amount: number) => formatMoney(amount, overview.data.country.currencyCode);
                return (
                  <Table.Tr key={row.role.id}>
                    {columns.map((column) => (
                      <Table.Td key={column.key} ta={column.numeric ? 'right' : undefined}>
                        {column.render(row, money)}
                      </Table.Td>
                    ))}
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
