import { AppShell, PageLoader, useAuth, type NavGroup } from '@cyient/shared-ui';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { devUsers } from '@/app/devUsers';
import { adminNav } from '@cyient/shared-ui/admin';
import { permissions } from '@/constants/permissions';
import { RouteKeys } from '@/routes/paths';

const viewIssues = [permissions.view];

export function AppLayout() {
  const { user } = useAuth();

  const nav: NavGroup[] = [
    {
      items: [
        {
          label: 'Pending with me',
          to: RouteKeys.PENDING,
          icon: <PendingActionsOutlinedIcon />,
          badge: user.pendingCount,
          anyOf: viewIssues,
        },
        {
          label: 'Issues',
          to: RouteKeys.ISSUES,
          icon: <ListAltOutlinedIcon />,
          anyOf: viewIssues,
          end: true,
        },
        {
          label: 'New issue',
          to: RouteKeys.ISSUE_NEW,
          icon: <AddCircleOutlineIcon />,
          anyOf: [permissions.create],
        },
      ],
    },
    {
      title: 'Manage',
      items: [
        {
          label: 'All issues',
          to: RouteKeys.MANAGE_ISSUES,
          icon: <FolderSharedOutlinedIcon />,
          anyOf: [permissions.adminIssues],
        },
        {
          label: 'Sourcing master',
          to: RouteKeys.MANAGE_SOURCING,
          icon: <AccountTreeOutlinedIcon />,
          anyOf: [permissions.manageMasters],
        },
      ],
    },
    adminNav(RouteKeys.ADMIN),
  ];

  return (
    <AppShell appName="MPPL Escalation Tracker" nav={nav} devUsers={devUsers}>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}
