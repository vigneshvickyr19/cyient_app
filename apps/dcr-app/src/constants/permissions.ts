/** The DCR API's permission codes (DcrPermissions in the backend) and the platform ones the app uses. */
export const permissions = {
  create: 'dcr.request.create',
  viewOwn: 'dcr.request.view.own',
  viewAll: 'dcr.request.view.all',
  export: 'dcr.request.export',
  release: 'dcr.request.release',
  manageTasks: 'platform.task.manage',
  adminRequests: 'platform.request.admin',
  viewAudit: 'platform.audit.view',
  manageEmails: 'platform.email.manage',
} as const;

/** Who may open the app's list pages (used by the navigation and the routes). */
export const viewRequests = [permissions.viewOwn, permissions.viewAll];
