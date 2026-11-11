import type { MockRoutes } from '../test';
import { staticPeople } from './staticPlatformData';

export function createStaticAdminRoutes(): MockRoutes {
  const roles = [
    {
      id: 1,
      name: 'Administrator',
      description: 'Full platform and application access',
      isSystem: true,
      userCount: 1,
      version: 'v1',
      permissions: [
        'platform.role.manage',
        'platform.user.manage',
        'platform.master.manage',
        'platform.audit.view',
        'platform.email.manage',
        'platform.log.view',
        'platform.job.run',
        'platform.sequence.manage',
      ],
    },
    {
      id: 2,
      name: 'Requester',
      description: 'Creates and submits new records',
      isSystem: false,
      userCount: 2,
      version: 'v1',
      permissions: ['dcr.request.create', 'dcr.request.view.own'],
    },
    {
      id: 3,
      name: 'Department Manager',
      description: 'Reviews and approves initial requests',
      isSystem: false,
      userCount: 1,
      version: 'v1',
      permissions: ['dcr.request.view.all', 'dcr.request.manage.tasks'],
    },
  ];

  const logins = [
    'CYIENTDLM\\admin',
    'CYIENTDLM\\requester',
    'CYIENTDLM\\requester2',
    'CYIENTDLM\\manager',
    'CYIENTDLM\\head',
    'CYIENTDLM\\ims',
    'CYIENTDLM\\mr',
    'CYIENTDLM\\viewer',
  ];

  const users = staticPeople.map((p, idx) => ({
    userId: p.id,
    login: logins[idx] ?? `CYIENTDLM\\user${String(p.id)}`,
    name: p.displayName,
    email: p.email,
    designation: p.designation,
    department: p.department,
    isActive: true,
    roles: [p.id === 1 ? 'Administrator' : 'Requester'],
  }));

  const numbering = [
    { key: 'DCR', prefix: 'DCR/{YYYY}/', currentNumber: 42, length: 4, resetPeriod: 'Yearly' },
    { key: 'DN', prefix: 'DN/{YYYY}/', currentNumber: 6, length: 4, resetPeriod: 'Yearly' },
    { key: 'CC', prefix: 'CC/{YYYY}/', currentNumber: 12, length: 4, resetPeriod: 'Yearly' },
    { key: 'ECN', prefix: 'ECN/{YYYY}/', currentNumber: 102, length: 4, resetPeriod: 'Yearly' },
    { key: 'MPPL', prefix: 'MPPL/{YYYY}/', currentNumber: 89, length: 4, resetPeriod: 'Yearly' },
  ];

  const jobs = [
    { id: 'nightly-sync', name: 'Nightly SAP Sync', schedule: '0 2 * * *', lastRunAt: '2026-11-10T02:00:00Z', lastStatus: 'Succeeded', isRunning: false },
    { id: 'email-retry', name: 'Pending Email Retry', schedule: '*/15 * * * *', lastRunAt: '2026-11-10T11:45:00Z', lastStatus: 'Succeeded', isRunning: false },
  ];

  const logs = [
    { id: 1, level: 'Information', message: 'User signed in', loggedAt: '2026-11-10T11:00:00Z', source: 'Auth' },
    { id: 2, level: 'Information', message: 'Background job completed', loggedAt: '2026-11-10T11:45:00Z', source: 'Scheduler' },
  ];

  const emails = [
    { id: 1, eventType: 'RequestSubmitted', toAddresses: 'manoj.manager@example.com', subject: 'DCR/2026/0042 submitted for review', status: 'Sent', createdAt: '2026-11-10T10:00:00Z', sentAt: '2026-11-10T10:01:00Z', attemptCount: 1, referenceId: 'DCR-0042', triggeredBy: 'Riya Requester' },
    { id: 2, eventType: 'RequestApproved', toAddresses: 'riya.requester@example.com', subject: 'DCR/2026/0042 approved by Dept Manager', status: 'Sent', createdAt: '2026-11-10T10:30:00Z', sentAt: '2026-11-10T10:31:00Z', attemptCount: 1, referenceId: 'DCR-0042', triggeredBy: 'Manoj Manager' },
  ];

  const audit = [
    { id: 1, tableName: 'Request', recordId: 'p1', action: 'Update', fieldName: 'status', oldValue: 'Draft', newValue: 'ImsReview', changedAt: '2026-11-10T10:00:00Z', user: { id: 2, name: 'Riya Requester' }, traceId: 'tr-01' },
    { id: 2, tableName: 'Role', recordId: '1', action: 'Update', fieldName: 'permissions', oldValue: null, newValue: null, changedAt: '2026-11-10T09:00:00Z', user: { id: 1, name: 'Arjun Admin' }, traceId: 'tr-02' },
  ];

  return {
    'GET /api/v1/admin/roles': () => roles,
    'GET /api/v1/admin/roles/{roleId}': ({ params }) => roles.find((r) => r.id === Number(params.roleId)) ?? roles[0],
    'PUT /api/v1/admin/roles/{roleId}': ({ params, body }) => {
      const role = roles.find((r) => r.id === Number(params.roleId)) ?? roles[0];
      if (role && body && typeof body === 'object') {
        Object.assign(role, body);
      }
      return role;
    },
    'GET /api/v1/admin/roles/{roleId}/holders': () => users.slice(0, 2),
    'GET /api/v1/admin/users': () => ({
      data: users,
      meta: { page: 1, pageSize: 20, totalCount: users.length, totalPages: 1 },
    }),
    'GET /api/v1/admin/users/{userId}': ({ params }) => users.find((u) => u.userId === Number(params.userId)) ?? users[0],
    'PUT /api/v1/admin/users/{userId}/status': ({ params, body }) => {
      const u = users.find((item) => item.userId === Number(params.userId));
      if (u && body && typeof body === 'object') {
        Object.assign(u, body);
      }
      return u;
    },
    'GET /api/v1/admin/jobs': () => jobs,
    'POST /api/v1/admin/jobs/{jobId}/run': ({ params }) => {
      const j = jobs.find((item) => item.id === params.jobId);
      if (j) j.lastRunAt = new Date().toISOString();
      return j;
    },
    'GET /api/v1/admin/jobs/{jobId}/history': () => [
      { id: 1, startedAt: '2026-11-10T02:00:00Z', completedAt: '2026-11-10T02:01:15Z', status: 'Succeeded', itemsProcessed: 42 },
    ],
    'GET /api/v1/admin/logs': () => ({
      data: logs,
      meta: { page: 1, pageSize: 20, totalCount: logs.length, totalPages: 1 },
    }),
    'GET /api/v1/admin/numbering': () => numbering,
    'POST /api/v1/admin/numbering/{key}/reset': ({ params }) => {
      const item = numbering.find((n) => n.key === params.key);
      if (item) item.currentNumber = 0;
      return item;
    },
    'GET /api/v1/admin/audit': () => ({
      data: audit,
      meta: { page: 1, pageSize: 20, totalCount: audit.length, totalPages: 1 },
    }),
    'GET /api/v1/admin/emails': () => ({
      data: emails,
      meta: { page: 1, pageSize: 20, totalCount: emails.length, totalPages: 1 },
    }),
    'GET /api/v1/admin/emails/{id}': ({ params }) => emails.find((e) => e.id === Number(params.id)) ?? emails[0],
    'POST /api/v1/admin/emails/{id}/resend': ({ params }) => {
      const e = emails.find((item) => item.id === Number(params.id));
      if (e) e.attemptCount += 1;
      return e;
    },
  };
}
