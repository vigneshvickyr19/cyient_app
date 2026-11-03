import type { paths } from '@cyient/api-client/ecn';

export type NoteListQuery = NonNullable<paths['/api/v1/notes']['get']['parameters']['query']>;

/** Query keys of ECN data; a change to one note invalidates its details (with its log and attachments), lists and pending actions. */
export const noteKeys = {
  all: ['ecn', 'notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (query: NoteListQuery) => [...noteKeys.lists(), query] as const,
  pendingAll: () => [...noteKeys.all, 'pending'] as const,
  pending: (page: number, pageSize: number) => [...noteKeys.pendingAll(), page, pageSize] as const,
  detail: (publicId: string) => [...noteKeys.all, 'detail', publicId] as const,
  log: (publicId: string) => [...noteKeys.detail(publicId), 'log'] as const,
  attachments: (publicId: string, allVersions: boolean) => [...noteKeys.detail(publicId), 'attachments', allVersions] as const,
};
