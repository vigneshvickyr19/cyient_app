import type { ComplaintListQuery, InternalListQuery } from '@/types/complaints';

/**
 * The TanStack Query keys (tags) of the Customer Complaint app, by model. Fetching, caching, invalidating and every mutation use these
 * and nothing else, so one change refreshes exactly what it should. Each model's `all` is the prefix of its other keys:
 * invalidating `all` refreshes the lists, the details and the rest of that model.
 */

const complaint = {
  all: ['cc', 'complaints'] as const,
  lists: () => [...complaint.all, 'list'] as const,
  list: (query: ComplaintListQuery) => [...complaint.lists(), query] as const,
  pendingAll: () => [...complaint.all, 'pending'] as const,
  pending: (page: number, pageSize: number) => [...complaint.pendingAll(), page, pageSize] as const,
  earlier: (customerId: number, excluding: string | undefined) => [...complaint.all, 'earlier', customerId, excluding] as const,
  detail: (publicId: string) => [...complaint.all, 'detail', publicId] as const,
  log: (publicId: string) => [...complaint.detail(publicId), 'log'] as const,
  documents: (publicId: string, allVersions: boolean) => [...complaint.detail(publicId), 'documents', allVersions] as const,
};

const internal = {
  all: ['cc', 'internal'] as const,
  lists: () => [...internal.all, 'list'] as const,
  list: (query: InternalListQuery) => [...internal.lists(), query] as const,
  detail: (publicId: string) => [...internal.all, 'detail', publicId] as const,
};

const manage = {
  all: ['cc', 'manage'] as const,
  complaints: (query: ComplaintListQuery) => [...manage.all, 'complaints', query] as const,
  record: (publicId: string) => [...manage.all, 'record', publicId] as const,
  holidays: () => [...manage.all, 'holidays'] as const,
  holidayYear: (year: number) => [...manage.holidays(), year] as const,
};

export const ccTags = { complaint, internal, manage } as const;
