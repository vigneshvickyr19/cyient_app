import { NotFoundPage, useAuth } from '@cyient/shared-ui';
import { Navigate, Route, Routes } from 'react-router';
import { RouteKeys } from '@/routes/paths';
import { adminRoutes } from '@/routes/admin.routes';
import { issuesRoutes } from '@/routes/issues.routes';
import { manageRoutes } from '@/routes/manage.routes';
import { AppLayout } from '@/layouts/AppLayout';

export function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          index
          element={<Navigate to={user.pendingCount ? RouteKeys.PENDING : RouteKeys.ISSUES} replace />}
        />

        {issuesRoutes}
        {manageRoutes}
        {adminRoutes}

        <Route path={RouteKeys.NOT_FOUND} element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
