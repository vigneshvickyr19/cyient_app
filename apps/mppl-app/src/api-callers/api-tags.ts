import type { IssueListQuery, SourcingListQuery } from '@/types/issues';

/**
 * The TanStack Query keys (tags) of the MPPL app, by model. Fetching, caching, invalidating and every mutation use these
 * and nothing else, so one change refreshes exactly what it should. Each model's `all` is the prefix of its other keys:
 * invalidating `all` refreshes the lists, the details and the rest of that model.
 */

const issue = {
  all: ['mppl', 'issues'] as const,
  lists: () => [...issue.all, 'list'] as const,
  list: (query: IssueListQuery) => [...issue.lists(), query] as const,
  pendingAll: () => [...issue.all, 'pending'] as const,
  pending: (page: number, pageSize: number) => [...issue.pendingAll(), page, pageSize] as const,
  detail: (publicId: string) => [...issue.all, 'detail', publicId] as const,
  log: (publicId: string) => [...issue.detail(publicId), 'log'] as const,
  documents: (publicId: string, allVersions: boolean) => [...issue.detail(publicId), 'documents', allVersions] as const,
  poLine: (poNumber: string, lineNumber: number) => ['mppl', 'po-lines', poNumber, lineNumber] as const,
};

/** The sourcing master; a change to it refreshes its list, its rows and the New Issue form's lookups. */
const sourcing = {
  all: ['mppl', 'sourcing'] as const,
  lookupsAll: () => [...sourcing.all, 'lookup'] as const,
  lookup: (projectId: number, commodityId: number) => [...sourcing.lookupsAll(), projectId, commodityId] as const,
  lists: () => [...sourcing.all, 'list'] as const,
  list: (query: SourcingListQuery) => [...sourcing.lists(), query] as const,
  row: (id: number) => [...sourcing.all, 'row', id] as const,
};

const manage = {
  all: ['mppl', 'manage'] as const,
  issues: (query: IssueListQuery) => [...manage.all, 'issues', query] as const,
  record: (publicId: string) => [...manage.all, 'record', publicId] as const,
};

export const mpplTags = { issue, sourcing, manage } as const;
