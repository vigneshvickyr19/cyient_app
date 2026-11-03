import type { paths } from '@cyient/api-client/cc';

export type InternalListQuery = NonNullable<paths['/api/v1/internal-complaints']['get']['parameters']['query']>;

/** Query keys of internal complaints; a change to one invalidates its details and the lists. */
export const internalKeys = {
  all: ['cc', 'internal'] as const,
  lists: () => [...internalKeys.all, 'list'] as const,
  list: (query: InternalListQuery) => [...internalKeys.lists(), query] as const,
  detail: (publicId: string) => [...internalKeys.all, 'detail', publicId] as const,
};
