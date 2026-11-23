/* eslint-disable react-refresh/only-export-components -- route definitions: lazy pages and Route elements, not hot-reloaded components */
import { PageLoader, RequirePermission } from '@cyient/shared-ui';
import { lazy, Suspense } from 'react';
import { Route } from 'react-router';
import { permissions } from '@/constants/permissions';
import { RouteKeys, toRelativePath } from '@/routes/paths';

const ManageIssuesPage = lazy(() => import('@/views/manage/issues/list/ManageIssuesPage').then((m) => ({ default: m.ManageIssuesPage })));
const ManageIssuePage = lazy(() => import('@/views/manage/issues/detail/ManageIssuePage').then((m) => ({ default: m.ManageIssuePage })));
const SourcingPage = lazy(() => import('@/views/manage/sourcing/SourcingPage').then((m) => ({ default: m.SourcingPage })));

export const manageRoutes = (
  <>
    <Route
      path={toRelativePath(RouteKeys.MANAGE_ISSUES)}
      element={
        <RequirePermission anyOf={[permissions.adminIssues]}>
          <Suspense fallback={<PageLoader />}>
            <ManageIssuesPage />
          </Suspense>
        </RequirePermission>
      }
    />
    <Route
      path={toRelativePath(RouteKeys.MANAGE_ISSUE_DETAILS)}
      element={
        <RequirePermission anyOf={[permissions.adminIssues]}>
          <Suspense fallback={<PageLoader />}>
            <ManageIssuePage />
          </Suspense>
        </RequirePermission>
      }
    />
    <Route
      path={toRelativePath(RouteKeys.MANAGE_SOURCING)}
      element={
        <RequirePermission anyOf={[permissions.manageMasters]}>
          <Suspense fallback={<PageLoader />}>
            <SourcingPage />
          </Suspense>
        </RequirePermission>
      }
    />
  </>
);
