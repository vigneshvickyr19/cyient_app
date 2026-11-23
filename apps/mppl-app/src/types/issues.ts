import type { mpplEndpoints } from '@/api-callers/api-endpoints';
import type { paths } from '@cyient/api-client/mppl';

/** The query string of GET /api/v1/issues (and the same filters on the admin list and the Excel export). */
export type IssueListQuery = NonNullable<paths[typeof mpplEndpoints.issue.collection]['get']['parameters']['query']>;

/** The query string of GET /api/v1/admin/sourcing. */
export type SourcingListQuery = NonNullable<paths[typeof mpplEndpoints.sourcing.collection]['get']['parameters']['query']>;
