import type { paths } from '@cyient/api-client/mppl';

export type SourcingListQuery = NonNullable<paths['/api/v1/admin/sourcing']['get']['parameters']['query']>;

/** Query keys of the sourcing master; a change to it refreshes its list, its rows and the New Issue form's lookups. */
export const sourcingKeys = {
  all: ['mppl', 'sourcing'] as const,
  lookup: (projectId: number, commodityId: number) => [...sourcingKeys.all, 'lookup', projectId, commodityId] as const,
  lists: () => [...sourcingKeys.all, 'list'] as const,
  list: (query: SourcingListQuery) => [...sourcingKeys.lists(), query] as const,
  row: (id: number) => [...sourcingKeys.all, 'row', id] as const,
};
