import type { paths } from '@cyient/api-client/dn';

export type RequestListQuery = NonNullable<paths['/api/v1/requests']['get']['parameters']['query']>;

/** Query keys of Deviation Note data; a change to one request invalidates its details, lists and pending requests. */
export const requestKeys = {
  all: ['dn', 'requests'] as const,
  lists: () => [...requestKeys.all, 'list'] as const,
  list: (query: RequestListQuery) => [...requestKeys.lists(), query] as const,
  pending: (page: number, pageSize: number) => [...requestKeys.all, 'pending', page, pageSize] as const,
  detail: (publicId: string) => [...requestKeys.all, 'detail', publicId] as const,
  history: (publicId: string) => [...requestKeys.detail(publicId), 'history'] as const,
  documents: (publicId: string, allVersions: boolean) => [...requestKeys.detail(publicId), 'documents', allVersions] as const,
  /** A change category's reviewer boxes, for the form. */
  boxes: (changeCategoryId: number) => ['dn', 'reviewer-boxes', changeCategoryId] as const,
};
