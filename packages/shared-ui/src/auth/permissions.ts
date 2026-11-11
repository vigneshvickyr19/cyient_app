/** Permissions for the platform administration and audit capabilities. */
export const platformPermissions = {
  roles: 'platform.role.manage',
  users: 'platform.user.manage',
  masters: 'platform.master.manage',
  audit: 'platform.audit.view',
  emails: 'platform.email.manage',
  logs: 'platform.log.view',
  jobs: 'platform.job.run',
  numbering: 'platform.sequence.manage',
} as const;
