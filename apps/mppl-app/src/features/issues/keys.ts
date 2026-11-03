import type { paths } from '@cyient/api-client/mppl';

export type IssueListQuery = NonNullable<paths['/api/v1/issues']['get']['parameters']['query']>;

/** Query keys of MPPL issues; a change to one issue refreshes its details, the lists and the pending issues. */
export const issueKeys = {
  all: ['mppl', 'issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (query: IssueListQuery) => [...issueKeys.lists(), query] as const,
  pending: (page: number, pageSize: number) => [...issueKeys.all, 'pending', page, pageSize] as const,
  detail: (publicId: string) => [...issueKeys.all, 'detail', publicId] as const,
  log: (publicId: string) => [...issueKeys.detail(publicId), 'log'] as const,
  documents: (publicId: string, allVersions: boolean) => [...issueKeys.detail(publicId), 'documents', allVersions] as const,
  poLine: (poNumber: string, lineNumber: number) => ['mppl', 'po-lines', poNumber, lineNumber] as const,
};
