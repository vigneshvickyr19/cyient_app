import { platformKeys } from '../api/platformKeys';

/** Query keys of the administration pages, under platformKeys.admin() so one invalidation can refresh them all. */
export const adminKeys = {
  all: () => platformKeys.admin(),
  permissions: () => [...platformKeys.admin(), 'permissions'] as const,
  roles: () => [...platformKeys.admin(), 'roles'] as const,
  role: (roleId: number) => [...adminKeys.roles(), roleId] as const,
  users: () => [...platformKeys.admin(), 'users'] as const,
  userList: (query: object) => [...adminKeys.users(), 'list', query] as const,
  user: (userId: number) => [...adminKeys.users(), 'detail', userId] as const,
  masterItems: (masterType: string) => [...platformKeys.admin(), 'masters', masterType] as const,
  audit: (query: object) => [...platformKeys.admin(), 'audit', query] as const,
  emails: () => [...platformKeys.admin(), 'emails'] as const,
  emailList: (query: object) => [...adminKeys.emails(), 'list', query] as const,
  email: (emailId: number) => [...adminKeys.emails(), 'detail', emailId] as const,
  logs: (query: object) => [...platformKeys.admin(), 'logs', query] as const,
  jobs: () => [...platformKeys.admin(), 'jobs'] as const,
  /** The mutation key of "Run now", so the page can show each job's latest result. */
  jobRun: () => [...adminKeys.jobs(), 'run'] as const,
  sequences: () => [...platformKeys.admin(), 'sequences'] as const,
  sequenceCheck: () => [...adminKeys.sequences(), 'check'] as const,
};
