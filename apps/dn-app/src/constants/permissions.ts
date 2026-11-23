/** The Deviation Note API's permission codes (DnPermissions in the backend) and the platform ones the app uses. */
export const permissions = {
  create: 'dn.request.create',
  viewOwn: 'dn.request.view.own',
  viewAll: 'dn.request.view.all',
  export: 'dn.request.export',
  updateSerials: 'dn.serial.update',
  manageTasks: 'platform.task.manage',
  adminRequests: 'platform.request.admin',
  manageMasters: 'platform.master.manage',
  viewAudit: 'platform.audit.view',
  manageEmails: 'platform.email.manage',
} as const;

/** Who may open the app's list pages (used by the navigation and the routes). */
export const viewRequests = [permissions.viewOwn, permissions.viewAll];
