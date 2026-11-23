import type { paths } from '@cyient/api-client/dcr';

/**
 * Every URL of the DCR API the app calls, by model. The API's address is VITE_API_BASE_URL (see app/env.ts); these
 * are the paths after it, written once here and checked against the API's OpenAPI document: a path the API does not have
 * does not compile. The {placeholders} are filled by the API client from each call's `path` option.
 */
export const dcrEndpoints = {
  adminRequest: {
    collection: '/api/v1/admin/requests',
    history: '/api/v1/admin/requests/{publicId}/history',
    emails: '/api/v1/admin/requests/{publicId}/emails',
    audit: '/api/v1/admin/requests/{publicId}/audit',
    cancel: '/api/v1/admin/requests/{publicId}/cancel',
    correct: '/api/v1/admin/requests/{publicId}/correct',
  },
  task: {
    collection: '/api/v1/admin/tasks',
    reassign: '/api/v1/admin/tasks/{taskId}/reassign',
  },
  clause: {
    collection: '/api/v1/requests/{publicId}/clauses',
    item: '/api/v1/requests/{publicId}/clauses/{clauseId}',
  },
  document: {
    collection: '/api/v1/requests/{publicId}/documents',
  },
  request: {
    collection: '/api/v1/requests',
    pending: '/api/v1/requests/pending',
    item: '/api/v1/requests/{publicId}',
    log: '/api/v1/requests/{publicId}/log',
    submit: '/api/v1/requests/{publicId}/submit',
    approve: '/api/v1/requests/{publicId}/approve',
    revert: '/api/v1/requests/{publicId}/revert',
    reject: '/api/v1/requests/{publicId}/reject',
    release: '/api/v1/requests/{publicId}/release',
    pdf: '/api/v1/requests/{publicId}/pdf',
    export: '/api/v1/requests/export',
  },
} as const satisfies Record<string, Record<string, keyof paths>>;
