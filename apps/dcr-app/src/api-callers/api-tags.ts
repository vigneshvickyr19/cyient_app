import type { RequestListQuery, TaskQuery } from '@/types/requests';

/**
 * The TanStack Query keys (tags) of the DCR app, by model. Fetching, caching, invalidating and every mutation use these
 * and nothing else, so one change refreshes exactly what it should. Each model's `all` is the prefix of its other keys:
 * invalidating `all` refreshes the lists, the details and the rest of that model.
 */

const request = {
  all: ['dcr', 'requests'] as const,
  lists: () => [...request.all, 'list'] as const,
  list: (query: RequestListQuery) => [...request.lists(), query] as const,
  pendingAll: () => [...request.all, 'pending'] as const,
  pending: (page: number, pageSize: number) => [...request.pendingAll(), page, pageSize] as const,
  detail: (publicId: string) => [...request.all, 'detail', publicId] as const,
  log: (publicId: string) => [...request.detail(publicId), 'log'] as const,
  documents: (publicId: string, allVersions: boolean) => [...request.detail(publicId), 'documents', allVersions] as const,
};

const manage = {
  all: ['dcr', 'manage'] as const,
  tasks: (query: TaskQuery) => [...manage.all, 'tasks', query] as const,
  requests: (query: RequestListQuery) => [...manage.all, 'requests', query] as const,
  record: (publicId: string) => [...manage.all, 'record', publicId] as const,
};

export const dcrTags = { request, manage } as const;
