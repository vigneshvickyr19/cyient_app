import { createContext, use, Suspense, type ReactNode } from 'react';
import { useResolvedPath } from 'react-router';
import { RequirePermission } from '../../auth/RequirePermission';
import { PageLoader } from '../../components/Loader';

const AdminBaseContext = createContext('/admin');

/**
 * The frame of one administration route: checks the page's permission, shows a loader while the page's code loads,
 * and works out the address the area is mounted at, so pages link to each other wherever the app mounts it. One
 * route up from a page route is the area's own route (admin/*), whose base is that address.
 */
export function AdminRoute({ permission, children }: { permission: string; children: ReactNode }) {
  const base = useResolvedPath('..').pathname.replace(/\/$/, '');
  return (
    <AdminBaseContext value={base}>
      <RequirePermission anyOf={[permission]}>
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </RequirePermission>
    </AdminBaseContext>
  );
}

/** The full address of an administration page, for example adminPath('roles', 7) is /admin/roles/7. */
export function useAdminPath(): (...segments: (string | number)[]) => string {
  const base = use(AdminBaseContext);
  return (...segments) => [base, ...segments.map((segment) => encodeURIComponent(String(segment)))].join('/');
}
