import type { dcrEndpoints } from '@/api-callers/api-endpoints';
import type { paths } from '@cyient/api-client/dcr';

/** The query string of GET /api/v1/requests (and the same filters on the admin list and the Excel export). */
export type RequestListQuery = NonNullable<paths[typeof dcrEndpoints.request.collection]['get']['parameters']['query']>;

/** The query string of GET /api/v1/admin/tasks (Open reviews). */
export type TaskQuery = NonNullable<paths[typeof dcrEndpoints.task.collection]['get']['parameters']['query']>;
