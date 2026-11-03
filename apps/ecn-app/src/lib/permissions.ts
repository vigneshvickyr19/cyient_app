/** The ECN API's permission codes (EcnPermissions in the backend) and the platform ones the app uses. */
export const permissions = {
  create: 'ecn.note.create',
  view: 'ecn.note.view',
  export: 'ecn.note.export',
  release: 'ecn.note.release',
  manageCustomers: 'ecn.customer.manage',
  manageTasks: 'platform.task.manage',
  adminRequests: 'platform.request.admin',
  viewAudit: 'platform.audit.view',
  manageEmails: 'platform.email.manage',
  manageMasters: 'platform.master.manage',
} as const;

/** Who may open a note's administration page: cancel it, or see its history, emails and audit trail. */
export const manageNotePermissions = [permissions.adminRequests, permissions.viewAudit, permissions.manageEmails];
