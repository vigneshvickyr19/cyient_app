import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, errorResponse } from '../test';
import { RequirePermission } from './RequirePermission';
import { useAuth } from './AuthProvider';

function WhoAmI() {
  const { user, can } = useAuth();
  return (
    <p>
      {user.displayName} can create: {String(can('dcr.request.create'))}
    </p>
  );
}

describe('AuthProvider', () => {
  it('loads the signed-in user and their permissions before showing the app', async () => {
    renderWithProviders(<WhoAmI />, { me: { displayName: 'Indira IMS', permissions: ['dcr.request.create'] } });

    expect(await screen.findByText('Indira IMS can create: true')).toBeInTheDocument();
  });

  it('explains when the account cannot be loaded', async () => {
    renderWithProviders(<WhoAmI />, {
      routes: { 'GET /api/v1/me': () => errorResponse(403, 'AUTH_NO_ACCESS', 'You have no access to this application.') },
    });

    expect(await screen.findByText('You have no access to this application.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('protects content by permission', async () => {
    renderWithProviders(
      <>
        <RequirePermission anyOf={['platform.role.manage']}>Roles page</RequirePermission>
        <RequirePermission anyOf={['dcr.request.view.own']} fallback={null}>
          My requests
        </RequirePermission>
      </>,
      { me: { permissions: ['dcr.request.view.own'] } },
    );

    expect(await screen.findByText('My requests')).toBeInTheDocument();
    expect(screen.getByText('No access')).toBeInTheDocument();
    expect(screen.queryByText('Roles page')).not.toBeInTheDocument();
  });
});
