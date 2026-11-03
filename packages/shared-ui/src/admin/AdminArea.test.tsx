import { configure, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test';
import { AdminArea } from './AdminArea';
import { adminNav } from './adminNav';
// The pages load lazily; importing them here first means the routes render without waiting for them to compile
import './numbering/NumberingPage';

// Pages render the whole provider tree and MUI; give slow machines time
configure({ asyncUtilTimeout: 5000 });

const renderArea = (path: string, permissions: string[]) =>
  renderWithProviders(
    <Routes>
      <Route path="admin/*" element={<AdminArea />} />
    </Routes>,
    { path, me: { permissions }, routes: { 'GET /api/v1/admin/sequences': () => [{ key: 'DCR', year: 2026, lastNumber: 12 }] } },
  );

describe('AdminArea', () => {
  it('opens the first page the user may use', async () => {
    renderArea('/admin', ['platform.sequence.manage']);

    expect(await screen.findByRole('heading', { name: 'Numbering' })).toBeInTheDocument();
    expect(await screen.findByRole('cell', { name: 'DCR' })).toBeInTheDocument();
  });

  it('says so when the user may use no administration page', async () => {
    renderArea('/admin', []);

    expect(await screen.findByText('No access')).toBeInTheDocument();
  });

  it('shows "Page not found" for an address it does not have', async () => {
    renderArea('/admin/nothing-here', ['platform.sequence.manage']);

    expect(await screen.findByText('Page not found')).toBeInTheDocument();
  });

  it('builds the navigation under the address the app mounts it at, each item behind its permission', () => {
    const nav = adminNav('/dcr/admin/');

    expect(nav.title).toBe('Administration');
    expect(nav.items.map((item) => item.to)).toEqual([
      '/dcr/admin/roles',
      '/dcr/admin/users',
      '/dcr/admin/masters',
      '/dcr/admin/audit',
      '/dcr/admin/emails',
      '/dcr/admin/logs',
      '/dcr/admin/jobs',
      '/dcr/admin/numbering',
    ]);
    expect(nav.items[0]?.anyOf).toEqual(['platform.role.manage']);
  });
});
