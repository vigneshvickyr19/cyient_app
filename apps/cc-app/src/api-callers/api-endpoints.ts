import type { paths } from '@cyient/api-client/cc';

/**
 * Every URL of the Customer Complaint API the app calls, by model. The API's address is VITE_API_BASE_URL (see app/env.ts); these
 * are the paths after it, written once here and checked against the API's OpenAPI document: a path the API does not have
 * does not compile. The {placeholders} are filled by the API client from each call's `path` option.
 */
export const ccEndpoints = {
  action: {
    collection: '/api/v1/complaints/{publicId}/actions',
    item: '/api/v1/complaints/{publicId}/actions/{actionId}',
    evidence: '/api/v1/complaints/{publicId}/actions/{actionId}/evidence',
    close: '/api/v1/complaints/{publicId}/actions/{actionId}/close',
  },
  complaint: {
    collection: '/api/v1/complaints',
    pending: '/api/v1/complaints/pending',
    item: '/api/v1/complaints/{publicId}',
    earlier: '/api/v1/complaints/earlier',
    log: '/api/v1/complaints/{publicId}/log',
    publish: '/api/v1/complaints/{publicId}/publish',
    actionPlanComplete: '/api/v1/complaints/{publicId}/action-plan/complete',
    close: '/api/v1/complaints/{publicId}/close',
    rootCause: '/api/v1/complaints/{publicId}/root-cause',
    verification: '/api/v1/complaints/{publicId}/verification',
    horizontalDeployment: '/api/v1/complaints/{publicId}/horizontal-deployment',
    closure: '/api/v1/complaints/{publicId}/closure',
    eightDReport: '/api/v1/complaints/{publicId}/8d-report',
  },
  containment: {
    collection: '/api/v1/complaints/{publicId}/containment-actions',
    item: '/api/v1/complaints/{publicId}/containment-actions/{lineId}',
  },
  document: {
    collection: '/api/v1/complaints/{publicId}/documents',
  },
  internalAction: {
    collection: '/api/v1/internal-complaints/{publicId}/actions',
    item: '/api/v1/internal-complaints/{publicId}/actions/{actionId}',
  },
  internalComplaint: {
    collection: '/api/v1/internal-complaints',
    item: '/api/v1/internal-complaints/{publicId}',
    close: '/api/v1/internal-complaints/{publicId}/close',
  },
  adminComplaint: {
    collection: '/api/v1/admin/complaints',
    history: '/api/v1/admin/complaints/{publicId}/history',
    emails: '/api/v1/admin/complaints/{publicId}/emails',
    audit: '/api/v1/admin/complaints/{publicId}/audit',
    cancel: '/api/v1/admin/complaints/{publicId}/cancel',
  },
  holiday: {
    collection: '/api/v1/admin/holidays',
    item: '/api/v1/admin/holidays/{id}',
  },
} as const satisfies Record<string, Record<string, keyof paths>>;
