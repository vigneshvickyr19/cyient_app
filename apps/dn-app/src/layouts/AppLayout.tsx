import { AppShell, PageLoader, useAuth, type NavGroup } from '@cyient/shared-ui';
import { adminNav } from '@cyient/shared-ui/admin';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
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
        { label: 'Pending requests', to: ROUTES.pending, icon: <PendingActionsOutlinedIcon />, badge: user.pendingCount, anyOf: viewRequests },
        { label: 'Requests', to: ROUTES.requests, icon: <DescriptionOutlinedIcon />, anyOf: viewRequests, end: true },
        { label: 'New deviation', to: ROUTES.newRequest, icon: <AddCircleOutlineIcon />, anyOf: [permissions.create] },
        { label: 'DN summary', to: ROUTES.summary, icon: <BarChartOutlinedIcon />, anyOf: [permissions.viewAll] },
      ],
    },
    {
      title: 'Manage',
      items: [
        { label: 'Open tasks', to: ROUTES.manageTasks, icon: <AssignmentIndOutlinedIcon />, anyOf: [permissions.manageTasks] },
        { label: 'All requests', to: ROUTES.manageRequests, icon: <FolderSharedOutlinedIcon />, anyOf: [permissions.adminRequests] },
        { label: 'Reviewer boxes', to: ROUTES.reviewerBoxes, icon: <AccountTreeOutlinedIcon />, anyOf: [permissions.manageMasters] },
      ],
    },
    adminNav(ROUTES.admin),
  ];

  return (
    <AppShell appName="Deviation Note" nav={nav} devUsers={devUsers}>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}
