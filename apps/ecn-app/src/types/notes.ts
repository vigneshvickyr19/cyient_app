import type { ecnEndpoints } from '@/api-callers/api-endpoints';
import type { paths } from '@cyient/api-client/ecn';

/** The query string of GET /api/v1/notes (and the same filters on the Excel export). */
export type NoteListQuery = NonNullable<paths[typeof ecnEndpoints.note.collection]['get']['parameters']['query']>;

/** The query string of GET /api/v1/admin/tasks (Open tasks). */
export type TaskQuery = NonNullable<paths[typeof ecnEndpoints.task.collection]['get']['parameters']['query']>;
