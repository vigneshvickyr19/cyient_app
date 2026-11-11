import type { MeResponse } from '@cyient/api-client/platform';

export const allPlatformPermissions = [
  'platform.role.manage',
  'platform.user.manage',
  'platform.master.manage',
  'platform.audit.view',
  'platform.email.manage',
  'platform.log.view',
  'platform.job.run',
  'platform.sequence.manage',
] as const;

export const allAppPermissions = [
  // DCR
  'dcr.request.create',
  'dcr.request.view.own',
  'dcr.request.view.all',
  'dcr.request.manage.tasks',
  'dcr.request.manage.all',
  // CC
  'cc.complaint.create',
  'cc.complaint.view.own',
  'cc.complaint.view.all',
  'cc.complaint.manage.tasks',
  'cc.complaint.manage.all',
  // DN
  'dn.request.create',
  'dn.request.view.own',
  'dn.request.view.all',
  'dn.request.manage.tasks',
  'dn.request.manage.all',
  // ECN
  'ecn.note.create',
  'ecn.note.view.own',
  'ecn.note.view.all',
  'ecn.note.manage.tasks',
  'ecn.note.manage.all',
  // MPPL
  'mppl.issue.create',
  'mppl.issue.view.own',
  'mppl.issue.view.all',
  'mppl.issue.manage.tasks',
  'mppl.issue.manage.all',
] as const;

export const defaultStaticUser: MeResponse = {
  userId: 1,
  displayName: 'Admin User',
  roles: ['Administrator', 'Requester', 'DeptManager', 'DeptHead', 'ImsReviewer', 'Mr'],
  permissions: [...allPlatformPermissions, ...allAppPermissions],
  pendingCount: 4,
};

export const staticUsersByLogin: Record<string, MeResponse> = {
  'CYIENTDLM\\admin': defaultStaticUser,
  'CYIENTDLM\\requester': {
    userId: 2,
    displayName: 'Riya Requester',
    roles: ['Requester'],
    permissions: [
      'dcr.request.create',
      'dcr.request.view.own',
      'cc.complaint.create',
      'cc.complaint.view.own',
      'dn.request.create',
      'dn.request.view.own',
      'ecn.note.create',
      'ecn.note.view.own',
      'mppl.issue.create',
      'mppl.issue.view.own',
    ],
    pendingCount: 1,
  },
  'CYIENTDLM\\requester2': {
    userId: 3,
    displayName: 'Rahul Requester',
    roles: ['Requester'],
    permissions: [
      'dcr.request.create',
      'dcr.request.view.own',
      'cc.complaint.create',
      'cc.complaint.view.own',
      'dn.request.create',
      'dn.request.view.own',
      'ecn.note.create',
      'ecn.note.view.own',
    ],
    pendingCount: 0,
  },
  'CYIENTDLM\\manager': {
    userId: 4,
    displayName: 'Manoj Manager',
    roles: ['DeptManager'],
    permissions: [
      'dcr.request.view.own',
      'dcr.request.view.all',
      'dcr.request.manage.tasks',
      'cc.complaint.view.all',
      'dn.request.view.all',
      'ecn.note.view.all',
      'mppl.issue.view.all',
    ],
    pendingCount: 3,
  },
  'CYIENTDLM\\head': {
    userId: 5,
    displayName: 'Harini Head',
    roles: ['DeptHead'],
    permissions: [
      'dcr.request.view.all',
      'dcr.request.manage.tasks',
      'cc.complaint.view.all',
      'dn.request.view.all',
      'ecn.note.view.all',
    ],
    pendingCount: 2,
  },
  'CYIENTDLM\\ims': {
    userId: 6,
    displayName: 'Indira IMS',
    roles: ['ImsReviewer'],
    permissions: [
      'dcr.request.create',
      'dcr.request.view.all',
      'dcr.request.manage.tasks',
      'dcr.request.manage.all',
      'platform.audit.view',
    ],
    pendingCount: 3,
  },
  'CYIENTDLM\\mr': {
    userId: 7,
    displayName: 'Mohan MR',
    roles: ['Mr'],
    permissions: [
      'dcr.request.view.all',
      'dcr.request.manage.tasks',
      'dcr.request.manage.all',
      'platform.audit.view',
    ],
    pendingCount: 1,
  },
  'CYIENTDLM\\viewer': {
    userId: 8,
    displayName: 'Vani Viewer',
    roles: ['QmsViewAll'],
    permissions: [
      'dcr.request.view.all',
      'cc.complaint.view.all',
      'dn.request.view.all',
      'ecn.note.view.all',
      'mppl.issue.view.all',
    ],
    pendingCount: 0,
  },
};

export function getStaticDevUser(login: string | null): MeResponse {
  if (!login) return defaultStaticUser;
  return staticUsersByLogin[login] ?? {
    ...defaultStaticUser,
    displayName: login.replace(/^.*\\/, ''),
  };
}
