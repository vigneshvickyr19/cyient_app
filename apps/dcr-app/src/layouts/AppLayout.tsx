import { AppShell, PageLoader, useAuth, type NavGroup } from '@cyient/shared-ui';
import { adminNav } from '@cyient/shared-ui/admin';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { devUsers } from '@/app/devUsers';
import { permissions, viewRequests } from '@/constants/permissions';
import { ROUTES } from '@/routes/paths';

export function AppLayout() {
  const { user } = useAuth();
  const nav: NavGroup[] = [
    {
      items: [
        { label: 'Pending actions', to: ROUTES.pending, icon: <PendingActionsOutlinedIcon />, badge: user.pendingCount, anyOf: viewRequests },
        { label: 'Requests', to: ROUTES.requests, icon: <DescriptionOutlinedIcon />, anyOf: viewRequests, end: true },
        { label: 'New request', to: ROUTES.newRequest, icon: <AddCircleOutlineIcon />, anyOf: [permissions.create] },
      ],
    },
    {
      title: 'Manage',
      items: [
        { label: 'Open reviews', to: ROUTES.manageTasks, icon: <AssignmentIndOutlinedIcon />, anyOf: [permissions.manageTasks] },
        { label: 'All requests', to: ROUTES.manageRequests, icon: <FolderSharedOutlinedIcon />, anyOf: [permissions.adminRequests] },
      ],
    },
    adminNav(ROUTES.admin),
  ];

  return (
    <AppShell appName="Document Change Request" nav={nav} devUsers={devUsers}>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}
