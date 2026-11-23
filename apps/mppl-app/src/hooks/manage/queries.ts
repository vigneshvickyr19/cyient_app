import type { RecordHistoryTabsProps } from '@cyient/shared-ui';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { mpplTags } from '@/api-callers/api-tags';
import { getIssueHistory, listAdminIssues, listIssueAudit, listIssueEmails } from '@/api-callers/manage/admin-issue.api';
import { useMpplApi } from '@/hooks/useMpplApi';
import type { IssueListQuery } from '@/types/issues';

/** Every issue, drafts included. */
export function useAdminIssues(query: IssueListQuery) {
  const api = useMpplApi();
  return useQuery({
    queryKey: mpplTags.manage.issues(query),
    queryFn: ({ signal }) => listAdminIssues(api, query, signal),
    placeholderData: keepPreviousData,
  });
}

/** The issue's history, emails and audit trail, for its Record tabs. */
export function useIssueRecord(publicId: string): Pick<RecordHistoryTabsProps, 'loaders' | 'queryKey'> {
  const api = useMpplApi();
  return {
    queryKey: mpplTags.manage.record(publicId),
    loaders: {
      history: ({ signal }) => getIssueHistory(api, publicId, signal),
      emails: ({ page, pageSize, signal }) => listIssueEmails(api, publicId, page, pageSize, signal),
      audit: ({ page, pageSize, signal }) => listIssueAudit(api, publicId, page, pageSize, signal),
    },
  };
}
