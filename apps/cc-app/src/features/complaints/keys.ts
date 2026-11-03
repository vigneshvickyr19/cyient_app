import type { paths } from '@cyient/api-client/cc';

export type ComplaintListQuery = NonNullable<paths['/api/v1/complaints']['get']['parameters']['query']>;

/** Query keys of external complaints; a change to one complaint invalidates its details, lists and pending actions. */
export const complaintKeys = {
  all: ['cc', 'complaints'] as const,
  lists: () => [...complaintKeys.all, 'list'] as const,
  list: (query: ComplaintListQuery) => [...complaintKeys.lists(), query] as const,
  pending: (page: number, pageSize: number) => [...complaintKeys.all, 'pending', page, pageSize] as const,
  earlier: (customerId: number, excluding: string | undefined) => [...complaintKeys.all, 'earlier', customerId, excluding] as const,
  detail: (publicId: string) => [...complaintKeys.all, 'detail', publicId] as const,
  log: (publicId: string) => [...complaintKeys.detail(publicId), 'log'] as const,
  documents: (publicId: string, allVersions: boolean) => [...complaintKeys.detail(publicId), 'documents', allVersions] as const,
};
