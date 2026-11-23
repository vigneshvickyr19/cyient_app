import type { RequestListQuery, TaskQuery } from '@/types/requests';

/**
 * The TanStack Query keys (tags) of the Deviation Note app, by model. Fetching, caching, invalidating and every mutation use these
 * and nothing else, so one change refreshes exactly what it should. Each model's `all` is the prefix of its other keys:
 * invalidating `all` refreshes the lists, the details and the rest of that model.
 */

const request = {
  all: ['dn', 'requests'] as const,
  lists: () => [...request.all, 'list'] as const,
  list: (query: RequestListQuery) => [...request.lists(), query] as const,
  pendingAll: () => [...request.all, 'pending'] as const,
  pending: (page: number, pageSize: number) => [...request.pendingAll(), page, pageSize] as const,
  detail: (publicId: string) => [...request.all, 'detail', publicId] as const,
  history: (publicId: string) => [...request.detail(publicId), 'history'] as const,
  documents: (publicId: string, allVersions: boolean) => [...request.detail(publicId), 'documents', allVersions] as const,
  /** A change category's reviewer boxes, for the form. */
  boxes: (changeCategoryId: number) => ['dn', 'reviewer-boxes', changeCategoryId] as const,
};

const report = {
  all: ['dn', 'reports'] as const,
  summary: (from: string | undefined, to: string | undefined) => [...report.all, 'summary', from ?? null, to ?? null] as const,
};

const manage = {
  all: ['dn', 'manage'] as const,
  tasks: (query: TaskQuery) => [...manage.all, 'tasks', query] as const,
  requests: (query: RequestListQuery) => [...manage.all, 'requests', query] as const,
  record: (publicId: string) => [...manage.all, 'record', publicId] as const,
  boxesAll: () => [...manage.all, 'reviewer-boxes'] as const,
  boxes: (changeCategoryId: number) => [...manage.boxesAll(), changeCategoryId] as const,
};

export const dnTags = { request, report, manage } as const;
