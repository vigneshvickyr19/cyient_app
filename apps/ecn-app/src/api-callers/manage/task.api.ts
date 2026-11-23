import { ecnEndpoints } from '@/api-callers/api-endpoints';
import type { EcnApi } from '@/types/api';
import type { TaskQuery } from '@/types/notes';

/** Open tasks (CFT members, initiators, Reviewers, Approvers, release), longest waiting first. */
export const listOpenTasks = (api: EcnApi, query: TaskQuery, signal?: AbortSignal) => api.get(ecnEndpoints.task.collection, { query, signal });
