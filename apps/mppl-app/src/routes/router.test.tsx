import { renderWithProviders } from '@cyient/shared-ui/test';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '@/routes/AppRoutes';
import { RouteKeys, toRelativePath } from '@/routes/paths';

describe('routes', () => {
  it("keeps the addresses the API's email links use", () => {
    expect(RouteKeys.ISSUES).toBe('/issues');
    expect(RouteKeys.ISSUE_DETAILS).toBe('/issues/:publicId');
    expect(RouteKeys.ADMIN).toBe('/admin');
  });

  it('writes a route as a path relative to its parent', () => {
    expect(toRelativePath(RouteKeys.ISSUE_DETAILS)).toBe('issues/:publicId');
  });

  it('redirects root to /pending when user has pending items', async () => {
    renderWithProviders(<AppRoutes />, {
      path: '/',
      me: { pendingCount: 5, permissions: ['mppl.issue.view'] },
    });

    expect(await screen.findByText('Pending with me')).toBeInTheDocument();
  });

  it('redirects root to /issues when user has no pending items', async () => {
    renderWithProviders(<AppRoutes />, {
      path: '/',
      me: { pendingCount: 0, permissions: ['mppl.issue.view'] },
    });

    const titles = await screen.findAllByText('MPPL Escalation Tracker');
    expect(titles.length).toBeGreaterThan(0);
  });

  it('shows NotFoundPage for non-existent routes', async () => {
    renderWithProviders(<AppRoutes />, {
      path: '/unknown-route-12345',
      me: { permissions: ['mppl.issue.view'] },
    });

    expect(await screen.findByText('Page not found')).toBeInTheDocument();
  });
});
