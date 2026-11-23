import { AppShell, PageLoader, useAuth, type NavGroup } from '@cyient/shared-ui';
import { adminNav } from '@cyient/shared-ui/admin';
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
import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { devUsers } from '@/app/devUsers';
import { manageNotePermissions, permissions, viewNotes } from '@/constants/permissions';
import { ROUTES } from '@/routes/paths';

export function AppLayout() {
  const { user } = useAuth();
  const nav: NavGroup[] = [
    {
      items: [
        { label: 'Pending actions', to: ROUTES.pending, icon: <PendingActionsOutlinedIcon />, badge: user.pendingCount, anyOf: viewNotes },
        { label: 'In progress', to: ROUTES.notes, icon: <TimelapseOutlinedIcon />, anyOf: viewNotes, end: true },
        { label: 'Closed', to: ROUTES.closed, icon: <TaskAltOutlinedIcon />, anyOf: viewNotes },
        { label: 'Search', to: ROUTES.search, icon: <SearchOutlinedIcon />, anyOf: viewNotes },
        { label: 'New ECN or TCN', to: ROUTES.newNote, icon: <AddCircleOutlineIcon />, anyOf: [permissions.create] },
      ],
    },
    {
      title: 'Reports',
      items: [
        { label: 'Tracker', to: ROUTES.tracker, icon: <TableViewOutlinedIcon />, anyOf: [permissions.export] },
        { label: 'Report', to: ROUTES.report, icon: <AssessmentOutlinedIcon />, anyOf: viewNotes },
      ],
    },
    {
      title: 'Manage',
      items: [
        { label: 'Open tasks', to: ROUTES.manageTasks, icon: <AssignmentIndOutlinedIcon />, anyOf: [permissions.manageTasks] },
        { label: 'All notes', to: ROUTES.manageNotes, icon: <FolderSharedOutlinedIcon />, anyOf: manageNotePermissions },
        { label: 'Customers', to: ROUTES.customers, icon: <BusinessOutlinedIcon />, anyOf: [permissions.manageCustomers] },
        { label: 'CFT functions', to: ROUTES.cftFunctions, icon: <GroupsOutlinedIcon />, anyOf: [permissions.manageMasters] },
      ],
    },
    adminNav(ROUTES.admin),
  ];

  return (
    <AppShell appName="Engineering Change Note" nav={nav} devUsers={devUsers}>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}
