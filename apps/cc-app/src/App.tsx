import { AppShell, NotFoundPage, PageLoader, RequirePermission, useAuth, type NavGroup } from '@cyient/shared-ui';
import { AdminArea, adminNav } from '@cyient/shared-ui/admin';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import FactoryOutlinedIcon from '@mui/icons-material/FactoryOutlined';
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router';
import { devUsers } from './config/devUsers';
import { permissions } from './lib/permissions';

const ComplaintsPage = lazy(() => import('./features/complaints/ComplaintsPage').then((m) => ({ default: m.ComplaintsPage })));
const PendingPage = lazy(() => import('./features/complaints/PendingPage').then((m) => ({ default: m.PendingPage })));
const ComplaintDetailsPage = lazy(() => import('./features/complaints/ComplaintDetailsPage').then((m) => ({ default: m.ComplaintDetailsPage })));
const NewComplaintPage = lazy(() => import('./features/complaints/ComplaintFormPage').then((m) => ({ default: m.NewComplaintPage })));
const EditComplaintPage = lazy(() => import('./features/complaints/ComplaintFormPage').then((m) => ({ default: m.EditComplaintPage })));
const InternalComplaintsPage = lazy(() => import('./features/internal/InternalComplaintsPage').then((m) => ({ default: m.InternalComplaintsPage })));
const InternalDetailsPage = lazy(() => import('./features/internal/InternalDetailsPage').then((m) => ({ default: m.InternalDetailsPage })));
const NewInternalPage = lazy(() => import('./features/internal/InternalFormPage').then((m) => ({ default: m.NewInternalPage })));
const EditInternalPage = lazy(() => import('./features/internal/InternalFormPage').then((m) => ({ default: m.EditInternalPage })));
const ManageComplaintsPage = lazy(() => import('./features/manage/ManageComplaintsPage').then((m) => ({ default: m.ManageComplaintsPage })));
const ManageComplaintPage = lazy(() => import('./features/manage/ManageComplaintPage').then((m) => ({ default: m.ManageComplaintPage })));
const HolidaysPage = lazy(() => import('./features/manage/HolidaysPage').then((m) => ({ default: m.HolidaysPage })));

const viewComplaints = [permissions.viewOwn, permissions.viewAll];
const viewInternal = [permissions.viewOwn, permissions.internalViewAll];

function Layout() {
  const { user } = useAuth();
  const nav: NavGroup[] = [
    {
      items: [
        { label: 'Pending actions', to: '/pending', icon: <PendingActionsOutlinedIcon />, badge: user.pendingCount, anyOf: viewComplaints },
        { label: 'External complaints', to: '/complaints', icon: <ReportProblemOutlinedIcon />, anyOf: viewComplaints, end: true },
        { label: 'New complaint', to: '/complaints/new', icon: <AddCircleOutlineIcon />, anyOf: [permissions.create] },
      ],
    },
    {
      title: 'Internal',
      items: [
        { label: 'Internal complaints', to: '/internal-complaints', icon: <FactoryOutlinedIcon />, anyOf: viewInternal, end: true },
        { label: 'New internal complaint', to: '/internal-complaints/new', icon: <NoteAddOutlinedIcon />, anyOf: [permissions.internalCreate] },
      ],
    },
    {
      title: 'Manage',
      items: [
        { label: 'All complaints', to: '/manage/complaints', icon: <FolderSharedOutlinedIcon />, anyOf: [permissions.adminRequests] },
        { label: 'Holiday calendar', to: '/manage/holidays', icon: <EventOutlinedIcon />, anyOf: [permissions.manageMasters] },
      ],
    },
    adminNav('/admin'),
  ];

  return (
    <AppShell appName="Customer Complaint" nav={nav} devUsers={devUsers}>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}

const guard = (anyOf: readonly string[], page: ReactNode) => <RequirePermission anyOf={anyOf}>{page}</RequirePermission>;

/** The Customer Complaint app's pages. Addresses match the API's email links: /cc/complaints/{id}. */
export function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to={user.pendingCount ? '/pending' : '/complaints'} replace />} />
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
