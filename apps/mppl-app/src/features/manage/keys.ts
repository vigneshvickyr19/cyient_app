import type { IssueListQuery } from '../issues/keys';

/** Query keys of the administration views of issues. */
export const manageKeys = {
  all: ['mppl', 'manage'] as const,
  issues: (query: IssueListQuery) => [...manageKeys.all, 'issues', query] as const,
  record: (publicId: string) => [...manageKeys.all, 'record', publicId] as const,
};
