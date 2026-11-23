import type { paths } from '@cyient/api-client/mppl';

/**
 * Every URL of the MPPL API the app calls, by model. The API's address is VITE_API_BASE_URL (see app/env.ts); these
 * are the paths after it, written once here and checked against the API's OpenAPI document: a path the API does not have
 * does not compile. The {placeholders} are filled by the API client from each call's `path` option.
 */
export const mpplEndpoints = {
  document: {
    collection: '/api/v1/issues/{publicId}/documents',
  },
  issue: {
    collection: '/api/v1/issues',
    pending: '/api/v1/issues/pending',
    item: '/api/v1/issues/{publicId}',
    log: '/api/v1/issues/{publicId}/log',
    submit: '/api/v1/issues/{publicId}/submit',
    close: '/api/v1/issues/{publicId}/close',
    export: '/api/v1/issues/export',
  },
  lookup: {
    poLine: '/api/v1/po-lines/{poNumber}/{lineNumber}',
    sourcing: '/api/v1/sourcing/lookup',
  },
  adminIssue: {
    collection: '/api/v1/admin/issues',
    history: '/api/v1/admin/issues/{publicId}/history',
    emails: '/api/v1/admin/issues/{publicId}/emails',
    audit: '/api/v1/admin/issues/{publicId}/audit',
    close: '/api/v1/admin/issues/{publicId}/close',
  },
  sourcing: {
    collection: '/api/v1/admin/sourcing',
    item: '/api/v1/admin/sourcing/{id}',
  },
} as const satisfies Record<string, Record<string, keyof paths>>;
