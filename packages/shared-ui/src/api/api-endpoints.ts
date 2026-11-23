import type { paths } from '@cyient/api-client/platform';

/**
 * Every URL of the platform API (the part every app's API shares: sign-in identity, master lists, people directory and
 * the administration pages) by model. The API's address is each app's VITE_API_BASE_URL; these are the paths after it,
 * written once here and checked against the platform OpenAPI document: a path the API does not have does not compile.
 */
export const platformEndpoints = {
  account: {
    me: '/api/v1/me',
  },
  directory: {
    users: '/api/v1/directory/users',
  },
  master: {
    types: '/api/v1/masters',
    items: '/api/v1/masters/{masterType}',
    adminItems: '/api/v1/admin/masters/{masterType}',
    adminItem: '/api/v1/admin/masters/{masterType}/{id}',
  },
  role: {
    collection: '/api/v1/admin/roles',
    item: '/api/v1/admin/roles/{roleId}',
    holders: '/api/v1/admin/roles/{roleId}/holders',
    holder: '/api/v1/admin/roles/{roleId}/holders/{holderId}',
  },
  permission: {
    collection: '/api/v1/admin/permissions',
  },
  user: {
    collection: '/api/v1/admin/users',
    item: '/api/v1/admin/users/{userId}',
    status: '/api/v1/admin/users/{userId}/status',
  },
  audit: {
    collection: '/api/v1/admin/audit',
    export: '/api/v1/admin/audit/export',
  },
  email: {
    collection: '/api/v1/admin/emails',
    item: '/api/v1/admin/emails/{emailId}',
    retry: '/api/v1/admin/emails/{emailId}/retry',
    resend: '/api/v1/admin/emails/{emailId}/resend',
  },
  log: {
    collection: '/api/v1/admin/logs',
  },
  job: {
    collection: '/api/v1/admin/jobs',
    run: '/api/v1/admin/jobs/{name}/run',
  },
  sequence: {
    collection: '/api/v1/admin/sequences',
    check: '/api/v1/admin/sequences/check',
  },
} as const satisfies Record<string, Record<string, keyof paths>>;

/**
 * Paths every app's own API has in common but the platform OpenAPI document does not describe, so they cannot be
 * checked here: each app's API (DCR, Deviation Note, Customer Complaint, MPPL) serves a stored document by its file id.
 */
export const commonEndpoints = {
  document: {
    file: '/api/v1/documents/{fileId}',
  },
} as const;
