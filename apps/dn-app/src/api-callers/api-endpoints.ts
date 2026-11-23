import type { paths } from '@cyient/api-client/dn';

/**
 * Every URL of the Deviation Note API the app calls, by model. The API's address is VITE_API_BASE_URL (see app/env.ts); these
 * are the paths after it, written once here and checked against the API's OpenAPI document: a path the API does not have
 * does not compile. The {placeholders} are filled by the API client from each call's `path` option.
 */
export const dnEndpoints = {
  adminRequest: {
    collection: '/api/v1/admin/requests',
    history: '/api/v1/admin/requests/{publicId}/history',
    emails: '/api/v1/admin/requests/{publicId}/emails',
    audit: '/api/v1/admin/requests/{publicId}/audit',
    close: '/api/v1/admin/requests/{publicId}/close',
    reviewers: '/api/v1/admin/requests/{publicId}/reviewers',
    reviewer: '/api/v1/admin/requests/{publicId}/reviewers/{reviewerId}',
    reviewerRemove: '/api/v1/admin/requests/{publicId}/reviewers/{reviewerId}/remove',
    informed: '/api/v1/admin/requests/{publicId}/informed',
  },
  adminReviewerBox: {
    collection: '/api/v1/admin/reviewer-boxes',
    item: '/api/v1/admin/reviewer-boxes/{id}',
  },
  task: {
    collection: '/api/v1/admin/tasks',
  },
  summary: {
    report: '/api/v1/reports/summary',
  },
  document: {
    collection: '/api/v1/requests/{publicId}/documents',
  },
  request: {
    collection: '/api/v1/requests',
    pending: '/api/v1/requests/pending',
    item: '/api/v1/requests/{publicId}',
    history: '/api/v1/requests/{publicId}/history',
    submit: '/api/v1/requests/{publicId}/submit',
    update: '/api/v1/requests/{publicId}/update',
    approve: '/api/v1/requests/{publicId}/approve',
    reject: '/api/v1/requests/{publicId}/reject',
    moreDetails: '/api/v1/requests/{publicId}/more-details',
    serials: '/api/v1/requests/{publicId}/serials',
    pdf: '/api/v1/requests/{publicId}/pdf',
    export: '/api/v1/requests/export',
  },
  reviewerBox: {
    collection: '/api/v1/reviewer-boxes',
  },
} as const satisfies Record<string, Record<string, keyof paths>>;
