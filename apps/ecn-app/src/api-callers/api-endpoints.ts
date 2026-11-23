import type { paths } from '@cyient/api-client/ecn';

/**
 * Every URL of the ECN API the app calls, by model. The API's address is VITE_API_BASE_URL (see app/env.ts); these
 * are the paths after it, written once here and checked against the API's OpenAPI document: a path the API does not have
 * does not compile. The {placeholders} are filled by the API client from each call's `path` option.
 */
export const ecnEndpoints = {
  adminNote: {
    history: '/api/v1/admin/notes/{publicId}/history',
    emails: '/api/v1/admin/notes/{publicId}/emails',
    audit: '/api/v1/admin/notes/{publicId}/audit',
    cancel: '/api/v1/admin/notes/{publicId}/cancel',
  },
  task: {
    collection: '/api/v1/admin/tasks',
  },
  cftFunction: {
    collection: '/api/v1/cft-functions',
    adminCollection: '/api/v1/admin/cft-functions',
    adminItem: '/api/v1/admin/cft-functions/{id}',
    adminActions: '/api/v1/admin/cft-functions/{id}/actions',
    adminActionItem: '/api/v1/admin/cft-functions/{id}/actions/{actionId}',
  },
  customer: {
    collection: '/api/v1/customers',
    adminItem: '/api/v1/admin/customers/{id}',
  },
  attachment: {
    collection: '/api/v1/notes/{publicId}/attachments',
    file: '/api/v1/attachments/{fileId}',
  },
  immediateAction: {
    collection: '/api/v1/notes/{publicId}/immediate-actions',
    item: '/api/v1/notes/{publicId}/immediate-actions/{actionId}',
  },
  note: {
    collection: '/api/v1/notes',
    pending: '/api/v1/notes/pending',
    item: '/api/v1/notes/{publicId}',
    log: '/api/v1/notes/{publicId}/log',
    cftTeam: '/api/v1/notes/{publicId}/cft-team',
    attendance: '/api/v1/notes/{publicId}/attendance',
    cftActionItem: '/api/v1/notes/{publicId}/cft-actions/{actionId}',
    sendMeetingNotification: '/api/v1/notes/{publicId}/send-meeting-notification',
    publishToReviewer: '/api/v1/notes/{publicId}/publish-to-reviewer',
    review: '/api/v1/notes/{publicId}/review',
    approve: '/api/v1/notes/{publicId}/approve',
    release: '/api/v1/notes/{publicId}/release',
    publishToCft: '/api/v1/notes/{publicId}/publish-to-cft',
    pdf: '/api/v1/notes/{publicId}/pdf',
    export: '/api/v1/notes/export',
  },
  part: {
    collection: '/api/v1/notes/{publicId}/parts',
    item: '/api/v1/notes/{publicId}/parts/{partId}',
  },
  report: {
    openReport: '/api/v1/report',
    openReportExport: '/api/v1/report/export',
    tracker: '/api/v1/tracker',
  },
} as const satisfies Record<string, Record<string, keyof paths>>;
