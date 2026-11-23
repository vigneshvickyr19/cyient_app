/* eslint-disable react-refresh/only-export-components -- route definitions: lazy pages and Route elements, not hot-reloaded components */
import { PageLoader } from '@cyient/shared-ui';
import { lazy, Suspense } from 'react';
import { Route } from 'react-router';
import { RouteKeys, toRelativePath } from '@/routes/paths';

const AdminArea = lazy(() => import('@cyient/shared-ui/admin').then((m) => ({ default: m.AdminArea })));

export const adminRoutes = (
  <Route
    path={toRelativePath(RouteKeys.ADMIN_WILDCARD)}
    element={
      <Suspense fallback={<PageLoader />}>
        <AdminArea />
      </Suspense>
    }
  />
);
