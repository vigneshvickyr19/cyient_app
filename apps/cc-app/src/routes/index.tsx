import { NotFoundPage, RequirePermission, useAuth } from '@cyient/shared-ui';
import { AdminArea } from '@cyient/shared-ui/admin';
import { lazy, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { permissions, viewComplaints, viewInternal } from '@/constants/permissions';
import { AppLayout } from '@/layouts/AppLayout';
import { ROUTES } from '@/routes/paths';

const ComplaintsPage = lazy(() => import('@/views/complaints/list/ComplaintsPage').then((m) => ({ default: m.ComplaintsPage })));
const PendingPage = lazy(() => import('@/views/pending/PendingPage').then((m) => ({ default: m.PendingPage })));
const ComplaintDetailsPage = lazy(() => import('@/views/complaints/detail/ComplaintDetailsPage').then((m) => ({ default: m.ComplaintDetailsPage })));
const NewComplaintPage = lazy(() => import('@/views/complaints/form/ComplaintFormPage').then((m) => ({ default: m.NewComplaintPage })));
const EditComplaintPage = lazy(() => import('@/views/complaints/form/ComplaintFormPage').then((m) => ({ default: m.EditComplaintPage })));
const InternalComplaintsPage = lazy(() => import('@/views/internal-complaints/list/InternalComplaintsPage').then((m) => ({ default: m.InternalComplaintsPage })));
const InternalDetailsPage = lazy(() => import('@/views/internal-complaints/detail/InternalDetailsPage').then((m) => ({ default: m.InternalDetailsPage })));
const NewInternalPage = lazy(() => import('@/views/internal-complaints/form/InternalFormPage').then((m) => ({ default: m.NewInternalPage })));
const EditInternalPage = lazy(() => import('@/views/internal-complaints/form/InternalFormPage').then((m) => ({ default: m.EditInternalPage })));
const ManageComplaintsPage = lazy(() => import('@/views/manage/complaints/list/ManageComplaintsPage').then((m) => ({ default: m.ManageComplaintsPage })));
const ManageComplaintPage = lazy(() => import('@/views/manage/complaints/detail/ManageComplaintPage').then((m) => ({ default: m.ManageComplaintPage })));
const HolidaysPage = lazy(() => import('@/views/manage/holidays/HolidaysPage').then((m) => ({ default: m.HolidaysPage })));

const guard = (anyOf: readonly string[], page: ReactNode) => <RequirePermission anyOf={anyOf}>{page}</RequirePermission>;

/** The Customer Complaint app's pages. Addresses match the API's email links: /cc/complaints/{id}. */
export function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to={user.pendingCount ? ROUTES.pending : ROUTES.complaints} replace />} />
        <Route path="pending" element={guard(viewComplaints, <PendingPage />)} />
        <Route path="complaints" element={guard(viewComplaints, <ComplaintsPage />)} />
        <Route path="complaints/new" element={guard([permissions.create], <NewComplaintPage />)} />
        <Route path="complaints/:publicId" element={<ComplaintDetailsPage />} />
        <Route path="complaints/:publicId/edit" element={guard([permissions.create], <EditComplaintPage />)} />
        <Route path="internal-complaints" element={guard(viewInternal, <InternalComplaintsPage />)} />
        <Route path="internal-complaints/new" element={guard([permissions.internalCreate], <NewInternalPage />)} />
        <Route path="internal-complaints/:publicId" element={guard(viewInternal, <InternalDetailsPage />)} />
        <Route path="internal-complaints/:publicId/edit" element={guard([permissions.internalCreate], <EditInternalPage />)} />
        <Route path="manage/complaints" element={guard([permissions.adminRequests], <ManageComplaintsPage />)} />
        <Route path="manage/complaints/:publicId" element={guard([permissions.adminRequests], <ManageComplaintPage />)} />
        <Route path="manage/holidays" element={guard([permissions.manageMasters], <HolidaysPage />)} />
        <Route path="admin/*" element={<AdminArea />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
