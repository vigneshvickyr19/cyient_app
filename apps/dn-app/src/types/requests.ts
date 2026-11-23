import type { dnEndpoints } from '@/api-callers/api-endpoints';
import type { paths } from '@cyient/api-client/dn';

/** The query string of GET /api/v1/requests (and the same filters on the admin list and the Excel export). */
export type RequestListQuery = NonNullable<paths[typeof dnEndpoints.request.collection]['get']['parameters']['query']>;

/** The query string of GET /api/v1/admin/tasks (Open tasks). */
export type TaskQuery = NonNullable<paths[typeof dnEndpoints.task.collection]['get']['parameters']['query']>;
