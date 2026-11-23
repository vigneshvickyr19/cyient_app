/** Every address of the app; the navigation and redirects use these, so a path is spelled in one place. */
export const ROUTES = {
  home: '/',
  pending: '/pending',
  requests: '/requests',
  newRequest: '/requests/new',
  request: (publicId: string) => `/requests/${publicId}`,
  editRequest: (publicId: string) => `/requests/${publicId}/edit`,
  summary: '/reports/summary',
  manageTasks: '/manage/tasks',
  manageRequests: '/manage/requests',
  manageRequest: (publicId: string) => `/manage/requests/${publicId}`,
  reviewerBoxes: '/manage/reviewer-boxes',
  admin: '/admin',
} as const;
