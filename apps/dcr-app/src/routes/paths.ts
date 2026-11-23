/** Every address of the app; the navigation and redirects use these, so a path is spelled in one place. */
export const ROUTES = {
  home: '/',
  pending: '/pending',
  requests: '/requests',
  newRequest: '/requests/new',
  request: (publicId: string) => `/requests/${publicId}`,
  editRequest: (publicId: string) => `/requests/${publicId}/edit`,
  manageTasks: '/manage/tasks',
  manageRequests: '/manage/requests',
  manageRequest: (publicId: string) => `/manage/requests/${publicId}`,
  admin: '/admin',
} as const;
