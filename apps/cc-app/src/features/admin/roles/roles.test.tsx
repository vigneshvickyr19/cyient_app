import type { PermissionItem, RoleDetails, RoleInput, RoleSummary } from '@cyient/api-client/platform';
import { configure, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { errorResponse, renderWithProviders, type MockRoutes } from '@cyient/shared-ui/test';
import { AdminArea } from '../AdminArea';
// The pages load lazily; importing them here first means the routes render without waiting for them to compile
import './RoleDetailsPage';
import './RolesPage';

const admin = { permissions: ['platform.role.manage', 'platform.user.manage'] };

const renderAdmin = (path: string, routes: MockRoutes) =>
  renderWithProviders(
    <Routes>
      <Route path="admin/*" element={<AdminArea />} />
    </Routes>,
    { path, routes, me: admin },
  );

const summaries: RoleSummary[] = [
  { id: 1, name: 'Administrator', description: 'All platform administration', isSystem: true, isActive: true, permissionCount: 10, holderCount: 2 },
  { id: 7, name: 'Quality Reviewer', description: null, isSystem: false, isActive: false, permissionCount: 1, holderCount: 0 },
];

const catalogue: PermissionItem[] = [
  { code: 'dcr.request.create', description: 'Raise a request' },
  { code: 'dcr.request.view.all', description: 'See every request' },
  { code: 'platform.role.manage', description: 'Create roles and set their permissions' },
];

const reviewer: RoleDetails = {
  id: 7,
  name: 'Quality Reviewer',
  description: 'Reviews quality documents',
  isSystem: false,
  isActive: true,
  permissions: ['dcr.request.create'],
  holders: [{ id: 31, adGroup: 'CYIENT\\QA-Team', loginName: null, user: null }],
  version: 'AAAAAAAAB9E=',
};

// Pages render the whole provider tree and MUI; give slow machines time
configure({ asyncUtilTimeout: 5000 });

describe('Roles', () => {
  it('lists every role with its type, state and counts', async () => {
    renderAdmin('/admin/roles', { 'GET /api/v1/admin/roles': () => summaries });

    const table = await screen.findByRole('table', { name: 'Roles' });
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(within(rows[1]!).getByText('Administrator')).toBeInTheDocument();
    expect(within(rows[1]!).getByText('System')).toBeInTheDocument();
    expect(within(rows[2]!).getByText('Quality Reviewer')).toBeInTheDocument();
    expect(within(rows[2]!).getByText('Switched off')).toBeInTheDocument();
  });

  it('shows an error with a retry when the roles cannot be loaded', async () => {
    renderAdmin('/admin/roles', { 'GET /api/v1/admin/roles': () => errorResponse(500, 'SERVER', 'The roles are unavailable.') });

    expect(await screen.findByText(/The roles are unavailable\./)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('saves the details and permissions with the version it read', async () => {
    const saved = vi.fn();
    renderAdmin('/admin/roles/7', {
      'GET /api/v1/admin/roles/{roleId}': () => reviewer,
      'GET /api/v1/admin/permissions': () => catalogue,
      'PUT /api/v1/admin/roles/{roleId}': ({ params, body }) => {
        const input = body as RoleInput;
        saved(params.roleId, input);
        return { ...reviewer, description: input.description ?? null, permissions: input.permissions ?? [], version: 'AAAAAAAAB9I=' };
      },
      'GET /api/v1/admin/roles': () => summaries,
    });

    const description = await screen.findByRole('textbox', { name: 'Description' });
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/admin/roles');
    await userEvent.clear(description);
    await userEvent.type(description, 'Releases documents');
    await userEvent.click(screen.getByRole('checkbox', { name: /See every request/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('The role has been saved.')).toBeInTheDocument();
    expect(saved).toHaveBeenCalledWith('7', {
      name: 'Quality Reviewer',
      description: 'Releases documents',
      isActive: true,
      permissions: ['dcr.request.create', 'dcr.request.view.all'],
      version: 'AAAAAAAAB9E=',
    });
  });

  it("doesn't let someone give an administration permission they don't hold", async () => {
    renderWithProviders(
      <Routes>
        <Route path="admin/*" element={<AdminArea />} />
      </Routes>,
      {
        path: '/admin/roles/7',
        me: { permissions: ['platform.role.manage'] },
        routes: {
          'GET /api/v1/admin/roles/{roleId}': () => reviewer,
          'GET /api/v1/admin/permissions': () => [...catalogue, { code: 'platform.audit.view', description: 'View and export audit records' }],
        },
      },
    );

    expect(await screen.findByRole('checkbox', { name: /View and export audit records/ })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: /Create roles and set their permissions/ })).toBeEnabled();
  });

  it('tells the user to reload when someone saved the role in between', async () => {
    renderAdmin('/admin/roles/7', {
      'GET /api/v1/admin/roles/{roleId}': () => reviewer,
      'GET /api/v1/admin/permissions': () => catalogue,
      'PUT /api/v1/admin/roles/{roleId}': () => errorResponse(409, 'PLATFORM_VERSION_CONFLICT', 'Someone else changed this role.'),
    });

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }));

    expect(await screen.findByText(/Reload to see their change/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
  });
});
