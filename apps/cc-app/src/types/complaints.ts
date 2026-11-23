import type { ccEndpoints } from '@/api-callers/api-endpoints';
import type { paths } from '@cyient/api-client/cc';

/** The query string of GET /api/v1/complaints (and the same filters on the admin list). */
export type ComplaintListQuery = NonNullable<paths[typeof ccEndpoints.complaint.collection]['get']['parameters']['query']>;

/** The query string of GET /api/v1/internal-complaints. */
export type InternalListQuery = NonNullable<paths[typeof ccEndpoints.internalComplaint.collection]['get']['parameters']['query']>;
