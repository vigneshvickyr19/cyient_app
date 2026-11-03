import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { useAuth } from '../auth/AuthProvider';
import { ErrorState } from '../components/ErrorState';
import { NotFoundPage } from '../layout/NotFoundPage';
import { adminPageOrder, adminPermissions, type AdminPage } from './permissions';
import { AdminRoute } from './shared/AdminBase';

const RolesPage = lazy(() => import('./roles/RolesPage'));
const RoleDetailsPage = lazy(() => import('./roles/RoleDetailsPage'));
const UsersPage = lazy(() => import('./users/UsersPage'));
const UserDetailsPage = lazy(() => import('./users/UserDetailsPage'));
const MasterTypesPage = lazy(() => import('./masters/MasterTypesPage'));
const MasterItemsPage = lazy(() => import('./masters/MasterItemsPage'));
const AuditPage = lazy(() => import('./audit/AuditPage'));
const EmailsPage = lazy(() => import('./emails/EmailsPage'));
const EmailDetailsPage = lazy(() => import('./emails/EmailDetailsPage'));
const LogsPage = lazy(() => import('./logs/LogsPage'));
const JobsPage = lazy(() => import('./jobs/JobsPage'));
const NumberingPage = lazy(() => import('./numbering/NumberingPage'));

const routes: readonly { path: string; page: AdminPage; Component: LazyExoticComponent<ComponentType> }[] = [
  { path: 'roles', page: 'roles', Component: RolesPage },
  { path: 'roles/:roleId', page: 'roles', Component: RoleDetailsPage },
  { path: 'users', page: 'users', Component: UsersPage },
  { path: 'users/:userId', page: 'users', Component: UserDetailsPage },
  { path: 'masters', page: 'masters', Component: MasterTypesPage },
  { path: 'masters/:masterType', page: 'masters', Component: MasterItemsPage },
  { path: 'audit', page: 'audit', Component: AuditPage },
  { path: 'emails', page: 'emails', Component: EmailsPage },
  { path: 'emails/:emailId', page: 'emails', Component: EmailDetailsPage },
  { path: 'logs', page: 'logs', Component: LogsPage },
  { path: 'jobs', page: 'jobs', Component: JobsPage },
  { path: 'numbering', page: 'numbering', Component: NumberingPage },
];

/** The area's home: the first administration page the user may open. */
function AdminHome() {
  const { can } = useAuth();
  const first = adminPageOrder.find((page) => can(adminPermissions[page]));
  if (!first) {
    return <ErrorState title="No access" message="You don't have permission to use any administration page. Ask an administrator if you need it." />;
  }
  return <Navigate to={first} replace />;
}

/**
 * The shared administration pages (roles, users, master lists, audit, emails, logs, jobs, numbering), each loaded when
 * first opened and protected by its permission. Mount it as <Route path="admin/*" element={<AdminArea />} />.
 */
export function AdminArea() {
  return (
    <Routes>
      <Route index element={<AdminHome />} />
      {routes.map(({ path, page, Component }) => (
        <Route
          key={path}
          path={path}
          element={
            <AdminRoute permission={adminPermissions[page]}>
              <Component />
            </AdminRoute>
          }
        />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
