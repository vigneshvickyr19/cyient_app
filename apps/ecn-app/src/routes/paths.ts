/** Every address of the app; the navigation and redirects use these, so a path is spelled in one place. */
export const ROUTES = {
  home: '/',
  pending: '/pending',
  notes: '/notes',
  closed: '/closed',
  search: '/search',
  newNote: '/notes/new',
  note: (publicId: string) => `/notes/${publicId}`,
  editNote: (publicId: string) => `/notes/${publicId}/edit`,
  tracker: '/tracker',
  report: '/report',
  manageTasks: '/manage/tasks',
  manageNotes: '/manage/notes',
  manageNote: (publicId: string) => `/manage/notes/${publicId}`,
  customers: '/manage/customers',
  cftFunctions: '/manage/cft-functions',
  admin: '/admin',
} as const;
