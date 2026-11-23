import { NotFoundPage, RequirePermission, useAuth } from '@cyient/shared-ui';
import { AdminArea } from '@cyient/shared-ui/admin';
import { lazy, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { permissions, viewRequests } from '@/constants/permissions';
import { AppLayout } from '@/layouts/AppLayout';
import { ROUTES } from '@/routes/paths';

const RequestsPage = lazy(() => import('@/views/requests/list/RequestsPage').then((m) => ({ default: m.RequestsPage })));
const PendingPage = lazy(() => import('@/views/pending/PendingPage').then((m) => ({ default: m.PendingPage })));
const RequestDetailsPage = lazy(() => import('@/views/requests/detail/RequestDetailsPage').then((m) => ({ default: m.RequestDetailsPage })));
const NewRequestPage = lazy(() => import('@/views/requests/form/RequestFormPage').then((m) => ({ default: m.NewRequestPage })));
const EditRequestPage = lazy(() => import('@/views/requests/form/RequestFormPage').then((m) => ({ default: m.EditRequestPage })));
const TasksPage = lazy(() => import('@/views/manage/tasks/TasksPage').then((m) => ({ default: m.TasksPage })));
const ManageRequestsPage = lazy(() => import('@/views/manage/requests/list/ManageRequestsPage').then((m) => ({ default: m.ManageRequestsPage })));
const ManageRequestPage = lazy(() => import('@/views/manage/requests/detail/ManageRequestPage').then((m) => ({ default: m.ManageRequestPage })));

const guard = (anyOf: readonly string[], page: ReactNode) => <RequirePermission anyOf={anyOf}>{page}</RequirePermission>;

/** The DCR app's pages. Addresses match the API's email links: /dcr/requests/{id}. */
export function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to={user.pendingCount ? ROUTES.pending : ROUTES.requests} replace />} />
        <Route path="pending" element={guard(viewRequests, <PendingPage />)} />
        <Route path="requests" element={guard(viewRequests, <RequestsPage />)} />
        <Route path="requests/new" element={guard([permissions.create], <NewRequestPage />)} />
        <Route path="requests/:publicId" element={<RequestDetailsPage />} />
        <Route path="requests/:publicId/edit" element={guard([permissions.create], <EditRequestPage />)} />
        <Route path="manage/tasks" element={guard([permissions.manageTasks], <TasksPage />)} />
        <Route path="manage/requests" element={guard([permissions.adminRequests], <ManageRequestsPage />)} />
        <Route path="manage/requests/:publicId" element={guard([permissions.adminRequests], <ManageRequestPage />)} />
        <Route path="admin/*" element={<AdminArea />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
