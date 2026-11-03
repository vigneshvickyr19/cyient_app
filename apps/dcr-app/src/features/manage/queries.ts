import type { AdminActionInput, CorrectionInput, paths, ReassignInput } from '@cyient/api-client/dcr';
import { useNotify, type RecordHistoryTabsProps } from '@cyient/shared-ui';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDcrApi } from '../../lib/api';
import { requestKeys, type RequestListQuery } from '../requests/keys';

export type TaskQuery = NonNullable<paths['/api/v1/admin/tasks']['get']['parameters']['query']>;

const manageKeys = {
  all: ['dcr', 'manage'] as const,
  tasks: (query: TaskQuery) => [...manageKeys.all, 'tasks', query] as const,
  requests: (query: RequestListQuery) => [...manageKeys.all, 'requests', query] as const,
  record: (publicId: string) => [...manageKeys.all, 'record', publicId] as const,
};

/** Open reviews, longest waiting first. */
export function useOpenTasks(query: TaskQuery) {
  const api = useDcrApi();
  return useQuery({
    queryKey: manageKeys.tasks(query),
    queryFn: ({ signal }) => api.get('/api/v1/admin/tasks', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

/** Every request, drafts included. */
export function useAdminRequests(query: RequestListQuery) {
  const api = useDcrApi();
  return useQuery({
    queryKey: manageKeys.requests(query),
    queryFn: ({ signal }) => api.get('/api/v1/admin/requests', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

/** The request's history, emails and audit trail, for its Record tabs. */
export function useRequestRecord(publicId: string): Pick<RecordHistoryTabsProps, 'loaders' | 'queryKey'> {
  const api = useDcrApi();
  const path = { publicId };
  return {
    queryKey: manageKeys.record(publicId),
    loaders: {
      history: async ({ signal }) => (await api.get('/api/v1/admin/requests/{publicId}/history', { path, signal })).data,
      emails: ({ page, pageSize, signal }) => api.get('/api/v1/admin/requests/{publicId}/emails', { path, query: { page, pageSize }, signal }),
      audit: ({ page, pageSize, signal }) => api.get('/api/v1/admin/requests/{publicId}/audit', { path, query: { page, pageSize }, signal }),
    },
  };
}

/** After an administrator's change, every view of requests and tasks is out of date. */
function useManageChanged() {
  const queryClient = useQueryClient();
  const notify = useNotify();
  return (message: string | null, fallback: string) => {
    void queryClient.invalidateQueries({ queryKey: manageKeys.all });
    void queryClient.invalidateQueries({ queryKey: requestKeys.all });
    notify.success(message ?? fallback);
  };
}

export function useReassignTask() {
  const api = useDcrApi();
  const changed = useManageChanged();
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: number; input: ReassignInput }) =>
      api.post('/api/v1/admin/tasks/{taskId}/reassign', { path: { taskId }, body: input }),
    onSuccess: (result) => {
      changed(result.message, 'The review is reassigned and the new reviewer is emailed.');
    },
  });
}

export function useCancelRequest(publicId: string) {
  const api = useDcrApi();
  const changed = useManageChanged();
  return useMutation({
    mutationFn: (input: AdminActionInput) => api.post('/api/v1/admin/requests/{publicId}/cancel', { path: { publicId }, body: input }),
    onSuccess: (result) => {
      changed(result.message, 'The request is cancelled and the requester is emailed.');
    },
  });
}

export function useCorrectRequest(publicId: string) {
  const api = useDcrApi();
  const changed = useManageChanged();
  return useMutation({
    mutationFn: (input: CorrectionInput) => api.post('/api/v1/admin/requests/{publicId}/correct', { path: { publicId }, body: input }),
    onSuccess: (result) => {
      changed(result.message, 'The request is corrected.');
    },
  });
}
