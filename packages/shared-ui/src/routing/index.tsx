import { lazy, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import { RequirePermission } from '../auth/RequirePermission';

// A page's props are whatever the page declares, so "any component" is what the loader has to accept
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = ComponentType<any>;

/**
 * A page that is loaded when it is first opened, from a module that exports it by name:
 * `lazyNamed(() => import('@/views/requests/list/RequestsPage'), 'RequestsPage')`.
 */
export function lazyNamed<Module, Name extends keyof Module & string>(
  load: () => Promise<Module>,
  name: Name,
): LazyExoticComponent<Extract<Module[Name], AnyComponent>> {
  const loadPage = async () => ({ default: (await load())[name] as unknown as ComponentType });
  return lazy(loadPage) as unknown as LazyExoticComponent<Extract<Module[Name], AnyComponent>>;
}

/** A page only for people who hold one of the permission codes, as the API enforces; others get a "no access" page. */
export function guarded(anyOf: readonly string[], page: ReactNode) {
  return <RequirePermission anyOf={anyOf}>{page}</RequirePermission>;
}

/** A route as the path React Router wants for a child route: without the leading slash. */
export function toRelativePath(route: string): string {
  return route.replace(/^\//, '');
}
