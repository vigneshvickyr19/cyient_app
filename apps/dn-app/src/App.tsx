import { AppShell, NotFoundPage, PageLoader, RequirePermission, useAuth, type NavGroup } from '@cyient/shared-ui';
import { AdminArea, adminNav } from './features/admin';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router';
import { devUsers } from './config/devUsers';
import { permissions } from './lib/permissions';

const RequestsPage = lazy(() => import('./features/requests/RequestsPage').then((m) => ({ default: m.RequestsPage })));
const PendingPage = lazy(() => import('./features/requests/PendingPage').then((m) => ({ default: m.PendingPage })));
const RequestDetailsPage = lazy(() => import('./features/requests/RequestDetailsPage').then((m) => ({ default: m.RequestDetailsPage })));
const NewRequestPage = lazy(() => import('./features/requests/RequestFormPage').then((m) => ({ default: m.NewRequestPage })));
const EditRequestPage = lazy(() => import('./features/requests/RequestFormPage').then((m) => ({ default: m.EditRequestPage })));
const SummaryPage = lazy(() => import('./features/reports/SummaryPage').then((m) => ({ default: m.SummaryPage })));
const TasksPage = lazy(() => import('./features/manage/TasksPage').then((m) => ({ default: m.TasksPage })));
const ManageRequestsPage = lazy(() => import('./features/manage/ManageRequestsPage').then((m) => ({ default: m.ManageRequestsPage })));
const ManageRequestPage = lazy(() => import('./features/manage/ManageRequestPage').then((m) => ({ default: m.ManageRequestPage })));
const ReviewerBoxesPage = lazy(() => import('./features/manage/ReviewerBoxesPage').then((m) => ({ default: m.ReviewerBoxesPage })));

const viewRequests = [permissions.viewOwn, permissions.viewAll];

function Layout() {
  const { user } = useAuth();
  const nav: NavGroup[] = [
    {
      items: [
        { label: 'Pending requests', to: '/pending', icon: <PendingActionsOutlinedIcon />, badge: user.pendingCount, anyOf: viewRequests },
        { label: 'Requests', to: '/requests', icon: <DescriptionOutlinedIcon />, anyOf: viewRequests, end: true },
        { label: 'New deviation', to: '/requests/new', icon: <AddCircleOutlineIcon />, anyOf: [permissions.create] },
        { label: 'DN summary', to: '/reports/summary', icon: <BarChartOutlinedIcon />, anyOf: [permissions.viewAll] },
      ],
    },
    {
      title: 'Manage',
      items: [
        { label: 'Open tasks', to: '/manage/tasks', icon: <AssignmentIndOutlinedIcon />, anyOf: [permissions.manageTasks] },
        { label: 'All requests', to: '/manage/requests', icon: <FolderSharedOutlinedIcon />, anyOf: [permissions.adminRequests] },
        { label: 'Reviewer boxes', to: '/manage/reviewer-boxes', icon: <AccountTreeOutlinedIcon />, anyOf: [permissions.manageMasters] },
      ],
    },
    adminNav('/admin'),
  ];

  return (
    <AppShell appName="Deviation Note" nav={nav} devUsers={devUsers}>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}

const guard = (anyOf: readonly string[], page: ReactNode) => <RequirePermission anyOf={anyOf}>{page}</RequirePermission>;

/** The Deviation Note app's pages. Addresses match the API's email links: /dn/requests/{id}. */
export function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to={user.pendingCount ? '/pending' : '/requests'} replace />} />
        <Route path="pending" element={guard(viewRequests, <PendingPage />)} />
        <Route path="requests" element={guard(viewRequests, <RequestsPage />)} />
        <Route path="requests/new" element={guard([permissions.create], <NewRequestPage />)} />
        <Route path="requests/:publicId" element={<RequestDetailsPage />} />
        <Route path="requests/:publicId/edit" element={guard([permissions.create], <EditRequestPage />)} />
        <Route path="reports/summary" element={guard([permissions.viewAll], <SummaryPage />)} />
        <Route path="manage/tasks" element={guard([permissions.manageTasks], <TasksPage />)} />
        <Route path="manage/requests" element={guard([permissions.adminRequests], <ManageRequestsPage />)} />
        <Route path="manage/requests/:publicId" element={guard([permissions.adminRequests], <ManageRequestPage />)} />
        <Route path="manage/reviewer-boxes" element={guard([permissions.manageMasters], <ReviewerBoxesPage />)} />
        <Route path="admin/*" element={<AdminArea />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
