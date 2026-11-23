import { dnEndpoints } from '@/api-callers/api-endpoints';
import type { DnApi } from '@/types/api';
import type { TaskQuery } from '@/types/requests';

/** Open tasks: who each deviation is pending with, longest waiting first. */
export const listOpenTasks = (api: DnApi, query: TaskQuery, signal?: AbortSignal) =>
  api.get(dnEndpoints.task.collection, { query, signal });
