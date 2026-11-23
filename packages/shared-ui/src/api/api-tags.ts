/**
 * The TanStack Query keys (tags) of the platform data every app shares, so each app caches and invalidates them the
 * same way: sign-in, master lists, people, and the administration pages. Fetching, caching, invalidating and mutations
 * use these and nothing else.
 */
export const platformTags = {
  all: ['platform'] as const,
  session: () => [...platformTags.all, 'session'] as const,
  me: () => [...platformTags.all, 'me'] as const,
  /** The signed-in user as one development login sees them (a switch of login is a different person). */
  meAs: (login: string | null) => [...platformTags.me(), login] as const,
  masterTypes: () => [...platformTags.all, 'master-types'] as const,
  masters: (type: string) => [...platformTags.all, 'masters', type] as const,
  people: (search: string, limit: number) => [...platformTags.all, 'people', search, limit] as const,
  admin: () => [...platformTags.all, 'admin'] as const,
};

/** The Record tabs (history, emails, audit trail) of one record, under the key its app gives the record. */
export const recordTags = {
  history: (recordKey: readonly unknown[]) => [...recordKey, 'history'] as const,
  emails: (recordKey: readonly unknown[], page: number) => [...recordKey, 'emails', page] as const,
  audit: (recordKey: readonly unknown[], page: number) => [...recordKey, 'audit', page] as const,
};

/** The administration pages, under platformTags.admin() so one invalidation can refresh them all. */
export const adminTags = {
  permissions: () => [...platformTags.admin(), 'permissions'] as const,
  roles: () => [...platformTags.admin(), 'roles'] as const,
  role: (roleId: number) => [...adminTags.roles(), roleId] as const,
  users: () => [...platformTags.admin(), 'users'] as const,
  userLists: () => [...adminTags.users(), 'list'] as const,
  userList: (query: object) => [...adminTags.userLists(), query] as const,
  user: (userId: number) => [...adminTags.users(), 'detail', userId] as const,
  masterItems: (masterType: string) => [...platformTags.admin(), 'masters', masterType] as const,
  audit: (query: object) => [...platformTags.admin(), 'audit', query] as const,
  emails: () => [...platformTags.admin(), 'emails'] as const,
  emailLists: () => [...adminTags.emails(), 'list'] as const,
  emailList: (query: object) => [...adminTags.emailLists(), query] as const,
  email: (emailId: number) => [...adminTags.emails(), 'detail', emailId] as const,
  logs: (query: object) => [...platformTags.admin(), 'logs', query] as const,
  jobs: () => [...platformTags.admin(), 'jobs'] as const,
  /** The mutation key of "Run now", so the page can show each job's latest result. */
  jobRun: () => [...adminTags.jobs(), 'run'] as const,
  sequences: () => [...platformTags.admin(), 'sequences'] as const,
  sequenceCheck: () => [...adminTags.sequences(), 'check'] as const,
};
