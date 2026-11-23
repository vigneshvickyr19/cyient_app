/* eslint-disable react-refresh/only-export-components -- route definitions: lazy pages and Route elements, not hot-reloaded components */
import { PageLoader, RequirePermission } from '@cyient/shared-ui';
import { lazy, Suspense } from 'react';
import { Route } from 'react-router';
import { permissions } from '@/constants/permissions';
import { RouteKeys, toRelativePath } from '@/routes/paths';

const PendingPage = lazy(() => import('@/views/pending/PendingPage').then((m) => ({ default: m.PendingPage })));
const IssuesPage = lazy(() => import('@/views/issues/list/IssuesPage').then((m) => ({ default: m.IssuesPage })));
const NewIssuePage = lazy(() => import('@/views/issues/form/IssueFormPage').then((m) => ({ default: m.NewIssuePage })));
const IssueDetailsPage = lazy(() => import('@/views/issues/detail/IssueDetailsPage').then((m) => ({ default: m.IssueDetailsPage })));
const EditIssuePage = lazy(() => import('@/views/issues/form/IssueFormPage').then((m) => ({ default: m.EditIssuePage })));

const viewIssues = [permissions.view];

export const issuesRoutes = (
  <>
    <Route
      path={toRelativePath(RouteKeys.PENDING)}
      element={
        <RequirePermission anyOf={viewIssues}>
          <Suspense fallback={<PageLoader />}>
            <PendingPage />
          </Suspense>
        </RequirePermission>
      }
    />
    <Route
      path={toRelativePath(RouteKeys.ISSUES)}
      element={
        <RequirePermission anyOf={viewIssues}>
          <Suspense fallback={<PageLoader />}>
            <IssuesPage />
          </Suspense>
        </RequirePermission>
      }
    />
    <Route
      path={toRelativePath(RouteKeys.ISSUE_NEW)}
      element={
        <RequirePermission anyOf={[permissions.create]}>
          <Suspense fallback={<PageLoader />}>
            <NewIssuePage />
          </Suspense>
        </RequirePermission>
      }
    />
    <Route
      path={toRelativePath(RouteKeys.ISSUE_DETAILS)}
      element={
        <Suspense fallback={<PageLoader />}>
          <IssueDetailsPage />
        </Suspense>
      }
    />
    <Route
      path={toRelativePath(RouteKeys.ISSUE_EDIT)}
      element={
        <RequirePermission anyOf={[permissions.create]}>
          <Suspense fallback={<PageLoader />}>
            <EditIssuePage />
          </Suspense>
        </RequirePermission>
      }
    />
  </>
);
