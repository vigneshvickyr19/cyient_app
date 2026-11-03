import type { RecordHistoryTabsProps } from '@cyient/shared-ui';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMpplApi } from '../../lib/api';
import type { IssueListQuery } from '../issues/keys';
import { manageKeys } from './keys';

/** Every issue, drafts included. */
export function useAdminIssues(query: IssueListQuery) {
  const api = useMpplApi();
  return useQuery({
    queryKey: manageKeys.issues(query),
    queryFn: ({ signal }) => api.get('/api/v1/admin/issues', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

/** The issue's history, emails and audit trail, for its Record tabs. */
export function useIssueRecord(publicId: string): Pick<RecordHistoryTabsProps, 'loaders' | 'queryKey'> {
  const api = useMpplApi();
  const path = { publicId };
  return {
    queryKey: manageKeys.record(publicId),
    loaders: {
      history: async ({ signal }) => (await api.get('/api/v1/admin/issues/{publicId}/history', { path, signal })).data,
      emails: ({ page, pageSize, signal }) => api.get('/api/v1/admin/issues/{publicId}/emails', { path, query: { page, pageSize }, signal }),
      audit: ({ page, pageSize, signal }) => api.get('/api/v1/admin/issues/{publicId}/audit', { path, query: { page, pageSize }, signal }),
    },
  };
}
