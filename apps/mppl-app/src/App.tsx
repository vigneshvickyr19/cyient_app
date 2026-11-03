import { AppShell, NotFoundPage, PageLoader, RequirePermission, useAuth, type NavGroup } from '@cyient/shared-ui';
import { AdminArea, adminNav } from '@cyient/shared-ui/admin';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router';
import { devUsers } from './config/devUsers';
import { permissions } from './lib/permissions';

const IssuesPage = lazy(() => import('./features/issues/IssuesPage').then((m) => ({ default: m.IssuesPage })));
const PendingPage = lazy(() => import('./features/issues/PendingPage').then((m) => ({ default: m.PendingPage })));
const IssueDetailsPage = lazy(() => import('./features/issues/IssueDetailsPage').then((m) => ({ default: m.IssueDetailsPage })));
const NewIssuePage = lazy(() => import('./features/issues/IssueFormPage').then((m) => ({ default: m.NewIssuePage })));
const EditIssuePage = lazy(() => import('./features/issues/IssueFormPage').then((m) => ({ default: m.EditIssuePage })));
const ManageIssuesPage = lazy(() => import('./features/manage/ManageIssuesPage').then((m) => ({ default: m.ManageIssuesPage })));
const ManageIssuePage = lazy(() => import('./features/manage/ManageIssuePage').then((m) => ({ default: m.ManageIssuePage })));
const SourcingPage = lazy(() => import('./features/sourcing/SourcingPage').then((m) => ({ default: m.SourcingPage })));

const viewIssues = [permissions.view];

function Layout() {
  const { user } = useAuth();
  const nav: NavGroup[] = [
    {
      items: [
        { label: 'Pending with me', to: '/pending', icon: <PendingActionsOutlinedIcon />, badge: user.pendingCount, anyOf: viewIssues },
        { label: 'Issues', to: '/issues', icon: <ListAltOutlinedIcon />, anyOf: viewIssues, end: true },
        { label: 'New issue', to: '/issues/new', icon: <AddCircleOutlineIcon />, anyOf: [permissions.create] },
      ],
    },
    {
      title: 'Manage',
      items: [
        { label: 'All issues', to: '/manage/issues', icon: <FolderSharedOutlinedIcon />, anyOf: [permissions.adminIssues] },
        { label: 'Sourcing master', to: '/manage/sourcing', icon: <AccountTreeOutlinedIcon />, anyOf: [permissions.manageMasters] },
      ],
    },
    adminNav('/admin'),
  ];

  return (
    <AppShell appName="MPPL Escalation Tracker" nav={nav} devUsers={devUsers}>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}

const guard = (anyOf: readonly string[], page: ReactNode) => <RequirePermission anyOf={anyOf}>{page}</RequirePermission>;

/** The MPPL Escalation Tracker's pages. Addresses match the API's email links: /mppl/issues/{publicId}. */
export function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to={user.pendingCount ? '/pending' : '/issues'} replace />} />
        <Route path="pending" element={guard(viewIssues, <PendingPage />)} />
        <Route path="issues" element={guard(viewIssues, <IssuesPage />)} />
        <Route path="issues/new" element={guard([permissions.create], <NewIssuePage />)} />
        <Route path="issues/:publicId" element={<IssueDetailsPage />} />
        <Route path="issues/:publicId/edit" element={guard([permissions.create], <EditIssuePage />)} />
        <Route path="manage/issues" element={guard([permissions.adminIssues], <ManageIssuesPage />)} />
        <Route path="manage/issues/:publicId" element={guard([permissions.adminIssues], <ManageIssuePage />)} />
        <Route path="manage/sourcing" element={guard([permissions.manageMasters], <SourcingPage />)} />
        <Route path="admin/*" element={<AdminArea />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
