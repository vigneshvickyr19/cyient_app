import type { AdminActionInput, CorrectionInput, ReassignInput } from '@cyient/api-client/dcr';
import { type RecordHistoryTabsProps, toastMeta } from '@cyient/shared-ui';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelRequest,
  correctRequest,
  getRequestHistory,
  listAdminRequests,
  listRequestAudit,
  listRequestEmails,
} from '@/api-callers/manage/admin-request.api';
import { dcrTags } from '@/api-callers/api-tags';
import { listOpenTasks, reassignTask } from '@/api-callers/manage/task.api';
import { useDcrApi } from '@/hooks/useDcrApi';
import type { RequestListQuery, TaskQuery } from '@/types/requests';

/** Open reviews, longest waiting first. */
export function useOpenTasks(query: TaskQuery) {
  const api = useDcrApi();
  return useQuery({
    queryKey: dcrTags.manage.tasks(query),
    queryFn: ({ signal }) => listOpenTasks(api, query, signal),
    placeholderData: keepPreviousData,
  });
}

/** Every request, drafts included. */
export function useAdminRequests(query: RequestListQuery) {
  const api = useDcrApi();
  return useQuery({
    queryKey: dcrTags.manage.requests(query),
    queryFn: ({ signal }) => listAdminRequests(api, query, signal),
    placeholderData: keepPreviousData,
  });
}

/** The request's history, emails and audit trail, for its Record tabs. */
export function useRequestRecord(publicId: string): Pick<RecordHistoryTabsProps, 'loaders' | 'queryKey'> {
  const api = useDcrApi();
  return {
    queryKey: dcrTags.manage.record(publicId),
    loaders: {
      history: ({ signal }) => getRequestHistory(api, publicId, signal),
      emails: ({ page, pageSize, signal }) => listRequestEmails(api, publicId, page, pageSize, signal),
      audit: ({ page, pageSize, signal }) => listRequestAudit(api, publicId, page, pageSize, signal),
    },
  };
}

/** After an administrator's change, every view of requests and tasks is out of date. */
function useManageChanged() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: dcrTags.manage.all });
    void queryClient.invalidateQueries({ queryKey: dcrTags.request.all });
  };
}

export function useReassignTask() {
  const api = useDcrApi();
  const changed = useManageChanged();
  return useMutation({
    meta: toastMeta({ success: 'The review is reassigned and the new reviewer is emailed.' }),
    mutationFn: ({ taskId, input }: { taskId: number; input: ReassignInput }) => reassignTask(api, taskId, input),
    onSuccess: changed,
  });
}

export function useCancelRequest(publicId: string) {
  const api = useDcrApi();
  const changed = useManageChanged();
  return useMutation({
    meta: toastMeta({ success: 'The request is cancelled and the requester is emailed.' }),
    mutationFn: (input: AdminActionInput) => cancelRequest(api, publicId, input),
    onSuccess: changed,
  });
}

export function useCorrectRequest(publicId: string) {
  const api = useDcrApi();
  const changed = useManageChanged();
  return useMutation({
    meta: toastMeta({ success: 'The request is corrected.' }),
    mutationFn: (input: CorrectionInput) => correctRequest(api, publicId, input),
    onSuccess: changed,
  });
}
