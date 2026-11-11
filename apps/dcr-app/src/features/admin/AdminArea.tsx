import { lazy, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { useAuth } from '@cyient/shared-ui';
import { ErrorState } from '@cyient/shared-ui';
import { NotFoundPage } from '@cyient/shared-ui';
import { adminPageOrder, adminPermissions, type AdminPage } from './permissions';
import { AdminRoute } from './shared/AdminBase';

export const RolesPage = lazy(() => import('./roles/RolesPage'));
export const RoleDetailsPage = lazy(() => import('./roles/RoleDetailsPage'));
export const UsersPage = lazy(() => import('./users/UsersPage'));
export const UserDetailsPage = lazy(() => import('./users/UserDetailsPage'));
export const MasterTypesPage = lazy(() => import('./masters/MasterTypesPage'));
export const MasterItemsPage = lazy(() => import('./masters/MasterItemsPage'));
export const AuditPage = lazy(() => import('./audit/AuditPage'));
export const EmailsPage = lazy(() => import('./emails/EmailsPage'));
export const EmailDetailsPage = lazy(() => import('./emails/EmailDetailsPage'));
export const LogsPage = lazy(() => import('./logs/LogsPage'));
export const JobsPage = lazy(() => import('./jobs/JobsPage'));
export const NumberingPage = lazy(() => import('./numbering/NumberingPage'));

const defaultRoutes: readonly { path: string; page: AdminPage; Component: LazyExoticComponent<ComponentType> }[] = [
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
function AdminHome({ exclude }: { exclude?: readonly AdminPage[] }) {
  const { can } = useAuth();
  const excludeSet = new Set(exclude ?? []);
  const first = adminPageOrder.filter((p) => !excludeSet.has(p)).find((page) => can(adminPermissions[page]));
  if (!first) {
    return <ErrorState title="No access" message="You don't have permission to use any administration page. Ask an administrator if you need it." />;
  }
  return <Navigate to={first} replace />;
}

export interface AdminAreaProps {
  /** Admin pages to exclude from routing */
  exclude?: readonly AdminPage[];
  /** Override any default page component with a custom component */
  overrides?: Partial<Record<AdminPage, ComponentType>>;
  /** Extra child `<Route>` elements to mount inside the admin area */
  children?: ReactNode;
}

/**
 * The shared administration pages (roles, users, master lists, audit, emails, logs, jobs, numbering), each loaded when
 * first opened and protected by its permission. Mount it as <Route path="admin/*" element={<AdminArea />} />.
 *
 * Can be customized by passing `exclude`, `overrides`, or extra child `<Route>` elements.
 */
export function AdminArea({ exclude, overrides, children }: AdminAreaProps = {}) {
  const excludeSet = new Set(exclude ?? []);
  const activeRoutes = defaultRoutes.filter(({ page }) => !excludeSet.has(page));

  return (
    <Routes>
      <Route index element={<AdminHome exclude={exclude} />} />
      {activeRoutes.map(({ path, page, Component }) => {
        const ResolvedComponent = overrides?.[page] ?? Component;
        return (
          <Route
            key={path}
            path={path}
            element={
              <AdminRoute permission={adminPermissions[page]}>
                <ResolvedComponent />
              </AdminRoute>
            }
          />
        );
      })}
      {children}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
