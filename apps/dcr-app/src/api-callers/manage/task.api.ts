import type { ReassignInput } from '@cyient/api-client/dcr';
import { dcrEndpoints } from '@/api-callers/api-endpoints';
import type { DcrApi } from '@/types/api';
import type { TaskQuery } from '@/types/requests';

/** Open reviews, longest waiting first. */
export const listOpenTasks = (api: DcrApi, query: TaskQuery, signal?: AbortSignal) =>
  api.get(dcrEndpoints.task.collection, { query, signal });

export const reassignTask = (api: DcrApi, taskId: number, input: ReassignInput) =>
  api.post(dcrEndpoints.task.reassign, { path: { taskId }, body: input });
