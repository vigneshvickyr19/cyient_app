import { AppShell, NotFoundPage, PageLoader, RequirePermission, useAuth, type NavGroup } from '@cyient/shared-ui';
import { AdminArea, adminNav } from './features/admin';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import TimelapseOutlinedIcon from '@mui/icons-material/TimelapseOutlined';
import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router';
import { devUsers } from './config/devUsers';
import { manageNotePermissions, permissions } from './lib/permissions';

const NotesPage = lazy(() => import('./features/notes/NotesPage').then((m) => ({ default: m.NotesPage })));
const PendingPage = lazy(() => import('./features/notes/PendingPage').then((m) => ({ default: m.PendingPage })));
const NoteDetailsPage = lazy(() => import('./features/notes/NoteDetailsPage').then((m) => ({ default: m.NoteDetailsPage })));
const NewNotePage = lazy(() => import('./features/notes/NoteFormPage').then((m) => ({ default: m.NewNotePage })));
const EditNotePage = lazy(() => import('./features/notes/NoteFormPage').then((m) => ({ default: m.EditNotePage })));
const TrackerPage = lazy(() => import('./features/reports/TrackerPage').then((m) => ({ default: m.TrackerPage })));
const ReportPage = lazy(() => import('./features/reports/ReportPage').then((m) => ({ default: m.ReportPage })));
const TasksPage = lazy(() => import('./features/manage/TasksPage').then((m) => ({ default: m.TasksPage })));
const ManageNotesPage = lazy(() => import('./features/manage/ManageNotesPage').then((m) => ({ default: m.ManageNotesPage })));
const ManageNotePage = lazy(() => import('./features/manage/ManageNotePage').then((m) => ({ default: m.ManageNotePage })));
const CustomersPage = lazy(() => import('./features/manage/CustomersPage').then((m) => ({ default: m.CustomersPage })));
const CftFunctionsPage = lazy(() => import('./features/manage/CftFunctionsPage').then((m) => ({ default: m.CftFunctionsPage })));

const viewNotes = [permissions.view];

function Layout() {
  const { user } = useAuth();
  const nav: NavGroup[] = [
    {
      items: [
        { label: 'Pending actions', to: '/pending', icon: <PendingActionsOutlinedIcon />, badge: user.pendingCount, anyOf: viewNotes },
        { label: 'In progress', to: '/notes', icon: <TimelapseOutlinedIcon />, anyOf: viewNotes, end: true },
        { label: 'Closed', to: '/closed', icon: <TaskAltOutlinedIcon />, anyOf: viewNotes },
        { label: 'Search', to: '/search', icon: <SearchOutlinedIcon />, anyOf: viewNotes },
        { label: 'New ECN or TCN', to: '/notes/new', icon: <AddCircleOutlineIcon />, anyOf: [permissions.create] },
      ],
    },
    {
      title: 'Reports',
      items: [
        { label: 'Tracker', to: '/tracker', icon: <TableViewOutlinedIcon />, anyOf: [permissions.export] },
        { label: 'Report', to: '/report', icon: <AssessmentOutlinedIcon />, anyOf: viewNotes },
      ],
    },
    {
      title: 'Manage',
      items: [
        { label: 'Open tasks', to: '/manage/tasks', icon: <AssignmentIndOutlinedIcon />, anyOf: [permissions.manageTasks] },
        { label: 'All notes', to: '/manage/notes', icon: <FolderSharedOutlinedIcon />, anyOf: manageNotePermissions },
        { label: 'Customers', to: '/manage/customers', icon: <BusinessOutlinedIcon />, anyOf: [permissions.manageCustomers] },
        { label: 'CFT functions', to: '/manage/cft-functions', icon: <GroupsOutlinedIcon />, anyOf: [permissions.manageMasters] },
      ],
    },
    adminNav('/admin'),
  ];

  return (
    <AppShell appName="Engineering Change Note" nav={nav} devUsers={devUsers}>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}

const guard = (anyOf: readonly string[], page: ReactNode) => <RequirePermission anyOf={anyOf}>{page}</RequirePermission>;

/** The ECN app's pages, for ECNs and TCNs alike. Addresses match the API's email links: /ecn/notes/{id}. */
export function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to={user.pendingCount ? '/pending' : '/notes'} replace />} />
        <Route path="pending" element={guard(viewNotes, <PendingPage />)} />
        <Route path="notes" element={guard(viewNotes, <NotesPage key="InProgress" view="InProgress" />)} />
        <Route path="closed" element={guard(viewNotes, <NotesPage key="Closed" view="Closed" />)} />
        <Route path="search" element={guard(viewNotes, <NotesPage key="All" view="All" />)} />
        <Route path="notes/new" element={guard([permissions.create], <NewNotePage />)} />
        {/* Named people (CFT members, Reviewer, Approver) open their note even without ecn.note.view, as the API allows */}
        <Route path="notes/:publicId" element={<NoteDetailsPage />} />
        <Route path="notes/:publicId/edit" element={guard([permissions.create], <EditNotePage />)} />
        <Route path="tracker" element={guard([permissions.export], <TrackerPage />)} />
        <Route path="report" element={guard(viewNotes, <ReportPage />)} />
        <Route path="manage/tasks" element={guard([permissions.manageTasks], <TasksPage />)} />
        <Route path="manage/notes" element={guard(manageNotePermissions, <ManageNotesPage />)} />
        <Route path="manage/notes/:publicId" element={guard(manageNotePermissions, <ManageNotePage />)} />
        <Route path="manage/customers" element={guard([permissions.manageCustomers], <CustomersPage />)} />
        <Route path="manage/cft-functions" element={guard([permissions.manageMasters], <CftFunctionsPage />)} />
        <Route path="admin/*" element={<AdminArea />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
