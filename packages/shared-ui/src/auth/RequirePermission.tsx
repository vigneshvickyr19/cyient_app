import type { ReactNode } from 'react';
import { ErrorState } from '../components/ErrorState';
import { useAuth } from './AuthProvider';

interface RequirePermissionProps {
  /** Shown when the user holds any one of these permission codes. */
  anyOf: readonly string[];
  children: ReactNode;
  /** What to show otherwise; by default a "no access" page. Pass null to show nothing (for buttons and menu items). */
  fallback?: ReactNode;
}

/** Protects a route or a piece of the page by permission, as the API does. */
export function RequirePermission({ anyOf, children, fallback }: RequirePermissionProps) {
  const { canAny } = useAuth();
  if (canAny(...anyOf)) return children;
  if (fallback !== undefined) return fallback;
  return <ErrorState title="No access" message="You don't have permission to open this page. Ask an administrator if you need it." />;
}
