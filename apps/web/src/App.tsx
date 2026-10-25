import { useState } from 'react';
import { AppShell, Group, NavLink, Title } from '@mantine/core';
import { EmployeesPage } from './pages/EmployeesPage';
import { InsightsPage } from './pages/InsightsPage';

const pages = {
  employees: { label: 'Employees', Page: EmployeesPage },
  insights: { label: 'Insights', Page: InsightsPage },
} as const;

type PageKey = keyof typeof pages;

export function App() {
  const [current, setCurrent] = useState<PageKey>('employees');
  const { Page } = pages[current];

  return (
    <AppShell header={{ height: 56 }} navbar={{ width: 200, breakpoint: 'sm' }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md">
          <Title order={3}>ACME Salary Management</Title>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="xs">
        {(Object.keys(pages) as PageKey[]).map((key) => (
          <NavLink
            key={key}
            component="button"
            label={pages[key].label}
            active={key === current}
            onClick={() => setCurrent(key)}
          />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>
        <Page />
      </AppShell.Main>
    </AppShell>
  );
}
