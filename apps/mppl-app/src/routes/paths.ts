/** The addresses of the MPPL app. The administration pages below ADMIN are the shared AdminArea's own. */
export const RouteKeys = {
  PENDING: '/pending',
  ISSUES: '/issues',
  ISSUE_NEW: '/issues/new',
  ISSUE_DETAILS: '/issues/:publicId',
  ISSUE_EDIT: '/issues/:publicId/edit',
  MANAGE_ISSUES: '/manage/issues',
  MANAGE_ISSUE_DETAILS: '/manage/issues/:publicId',
  MANAGE_SOURCING: '/manage/sourcing',
  ADMIN: '/admin',
  ADMIN_WILDCARD: '/admin/*',
  NOT_FOUND: '*',
} as const;

/** A route as the path React Router wants for a child route: without the leading slash. */
export function toRelativePath(route: string): string {
  return route.replace(/^\//, '');
}
