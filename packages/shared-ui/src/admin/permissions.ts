/** The permission codes that open each administration page, as the API checks them. */
export const adminPermissions = {
  roles: 'platform.role.manage',
  users: 'platform.user.manage',
  masters: 'platform.master.manage',
  audit: 'platform.audit.view',
  emails: 'platform.email.manage',
  logs: 'platform.log.view',
  jobs: 'platform.job.run',
  numbering: 'platform.sequence.manage',
} as const;

export type AdminPage = keyof typeof adminPermissions;

/** The pages in the order they appear in the navigation; the first one the user may open is the area's home. */
export const adminPageOrder: readonly AdminPage[] = ['roles', 'users', 'masters', 'audit', 'emails', 'logs', 'jobs', 'numbering'];
