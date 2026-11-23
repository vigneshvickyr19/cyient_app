/** The MPPL API's permission codes (MpplPermissions in the backend) and the platform ones the app uses. */
export const permissions = {
  create: 'mppl.issue.create',
  view: 'mppl.issue.view',
  export: 'mppl.issue.export',
  adminIssues: 'platform.request.admin',
  manageMasters: 'platform.master.manage',
  viewAudit: 'platform.audit.view',
  manageEmails: 'platform.email.manage',
} as const;
