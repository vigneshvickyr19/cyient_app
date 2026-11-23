import { AppShell, PageLoader, useAuth, type NavGroup } from '@cyient/shared-ui';
import { adminNav } from '@cyient/shared-ui/admin';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import FactoryOutlinedIcon from '@mui/icons-material/FactoryOutlined';
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { devUsers } from '@/app/devUsers';
import { permissions, viewComplaints, viewInternal } from '@/constants/permissions';
import { ROUTES } from '@/routes/paths';

export function AppLayout() {
  const { user } = useAuth();
  const nav: NavGroup[] = [
    {
      items: [
        { label: 'Pending actions', to: ROUTES.pending, icon: <PendingActionsOutlinedIcon />, badge: user.pendingCount, anyOf: viewComplaints },
        { label: 'External complaints', to: ROUTES.complaints, icon: <ReportProblemOutlinedIcon />, anyOf: viewComplaints, end: true },
        { label: 'New complaint', to: ROUTES.newComplaint, icon: <AddCircleOutlineIcon />, anyOf: [permissions.create] },
      ],
    },
    {
      title: 'Internal',
      items: [
        { label: 'Internal complaints', to: ROUTES.internalComplaints, icon: <FactoryOutlinedIcon />, anyOf: viewInternal, end: true },
        { label: 'New internal complaint', to: ROUTES.newInternalComplaint, icon: <NoteAddOutlinedIcon />, anyOf: [permissions.internalCreate] },
      ],
    },
    {
      title: 'Manage',
      items: [
        { label: 'All complaints', to: ROUTES.manageComplaints, icon: <FolderSharedOutlinedIcon />, anyOf: [permissions.adminRequests] },
        { label: 'Holiday calendar', to: ROUTES.holidays, icon: <EventOutlinedIcon />, anyOf: [permissions.manageMasters] },
      ],
    },
    adminNav(ROUTES.admin),
  ];

  return (
    <AppShell appName="Customer Complaint" nav={nav} devUsers={devUsers}>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}
