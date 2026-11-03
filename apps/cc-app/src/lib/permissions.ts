/** The Customer Complaint API's permission codes (CcPermissions in the backend) and the platform ones the app uses. */
export const permissions = {
  create: 'cc.complaint.create',
  viewOwn: 'cc.complaint.view.own',
  viewAll: 'cc.complaint.view.all',
  internalCreate: 'cc.internal.create',
  internalViewAll: 'cc.internal.view.all',
  adminRequests: 'platform.request.admin',
  viewAudit: 'platform.audit.view',
  manageEmails: 'platform.email.manage',
  manageMasters: 'platform.master.manage',
} as const;
