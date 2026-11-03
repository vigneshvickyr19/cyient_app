import type { paths } from '@cyient/api-client/dcr';

export type RequestListQuery = NonNullable<paths['/api/v1/requests']['get']['parameters']['query']>;

/** Query keys of DCR data; a change to one request invalidates its details, lists and pending actions. */
export const requestKeys = {
  all: ['dcr', 'requests'] as const,
  lists: () => [...requestKeys.all, 'list'] as const,
  list: (query: RequestListQuery) => [...requestKeys.lists(), query] as const,
  pending: (page: number, pageSize: number) => [...requestKeys.all, 'pending', page, pageSize] as const,
  detail: (publicId: string) => [...requestKeys.all, 'detail', publicId] as const,
  log: (publicId: string) => [...requestKeys.detail(publicId), 'log'] as const,
  documents: (publicId: string, allVersions: boolean) => [...requestKeys.detail(publicId), 'documents', allVersions] as const,
};
