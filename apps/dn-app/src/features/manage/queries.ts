import type {
  AddReviewerInput,
  AdminActionInput,
  ChangeReviewerInput,
  InformedPeopleInput,
  paths,
  RequestDetails,
  ReviewerBoxInput,
} from '@cyient/api-client/dn';
import { useNotify, type RecordHistoryTabsProps } from '@cyient/shared-ui';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDnApi } from '../../lib/api';
import { requestKeys, type RequestListQuery } from '../requests/keys';

export type TaskQuery = NonNullable<paths['/api/v1/admin/tasks']['get']['parameters']['query']>;

const manageKeys = {
  all: ['dn', 'manage'] as const,
  tasks: (query: TaskQuery) => [...manageKeys.all, 'tasks', query] as const,
  requests: (query: RequestListQuery) => [...manageKeys.all, 'requests', query] as const,
  record: (publicId: string) => [...manageKeys.all, 'record', publicId] as const,
  boxes: (changeCategoryId: number) => [...manageKeys.all, 'reviewer-boxes', changeCategoryId] as const,
};

/** Open tasks: who each deviation is pending with, longest waiting first. */
export function useOpenTasks(query: TaskQuery) {
  const api = useDnApi();
  return useQuery({
    queryKey: manageKeys.tasks(query),
    queryFn: ({ signal }) => api.get('/api/v1/admin/tasks', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

/** Every deviation, drafts included. */
export function useAdminRequests(query: RequestListQuery) {
  const api = useDnApi();
  return useQuery({
    queryKey: manageKeys.requests(query),
    queryFn: ({ signal }) => api.get('/api/v1/admin/requests', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

/** The deviation's history, emails and audit trail, for its Record tabs. */
export function useRequestRecord(publicId: string): Pick<RecordHistoryTabsProps, 'loaders' | 'queryKey'> {
  const api = useDnApi();
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

/** A change category's boxes, switched-off ones included, for IT's maintenance. */
export function useAdminReviewerBoxes(changeCategoryId: number | null) {
  const api = useDnApi();
  return useQuery({
    queryKey: manageKeys.boxes(changeCategoryId ?? 0),
    queryFn: async ({ signal }) =>
      (await api.get('/api/v1/admin/reviewer-boxes', { query: { changeCategoryId: changeCategoryId ?? undefined }, signal })).data,
    enabled: changeCategoryId !== null,
  });
}

/** After an administrator's change, every view of deviations and tasks is out of date; the new details are kept. */
function useManageChanged() {
  const queryClient = useQueryClient();
  const notify = useNotify();
  return (request: RequestDetails, message: string | null, fallback: string) => {
    queryClient.setQueryData(requestKeys.detail(request.publicId), request);
    void queryClient.invalidateQueries({ queryKey: manageKeys.all });
    void queryClient.invalidateQueries({ queryKey: requestKeys.all });
    notify.success(message ?? fallback);
  };
}

export function useCloseRequest(publicId: string) {
  const api = useDnApi();
  const changed = useManageChanged();
  return useMutation({
    mutationFn: (input: AdminActionInput) => api.post('/api/v1/admin/requests/{publicId}/close', { path: { publicId }, body: input }),
    onSuccess: (result) => {
      changed(result.data, result.message, 'The deviation is closed. Nobody is emailed.');
    },
  });
}

export function useAddReviewer(publicId: string) {
  const api = useDnApi();
  const changed = useManageChanged();
  return useMutation({
    mutationFn: (input: AddReviewerInput) => api.post('/api/v1/admin/requests/{publicId}/reviewers', { path: { publicId }, body: input }),
    onSuccess: (result) => {
      changed(result.data, result.message, 'The reviewer is added.');
    },
  });
}

export function useChangeReviewer(publicId: string) {
  const api = useDnApi();
  const changed = useManageChanged();
  return useMutation({
    mutationFn: ({ reviewerId, input }: { reviewerId: number; input: ChangeReviewerInput }) =>
      api.put('/api/v1/admin/requests/{publicId}/reviewers/{reviewerId}', { path: { publicId, reviewerId }, body: input }),
    onSuccess: (result) => {
      changed(result.data, result.message, 'The step has its new person.');
    },
  });
}

export function useRemoveReviewer(publicId: string) {
  const api = useDnApi();
  const changed = useManageChanged();
  return useMutation({
    mutationFn: ({ reviewerId, input }: { reviewerId: number; input: AdminActionInput }) =>
      api.post('/api/v1/admin/requests/{publicId}/reviewers/{reviewerId}/remove', { path: { publicId, reviewerId }, body: input }),
    onSuccess: (result) => {
      changed(result.data, result.message, 'The step is removed.');
    },
  });
}

export function useSetInformedPeople(publicId: string) {
  const api = useDnApi();
  const changed = useManageChanged();
  return useMutation({
    mutationFn: (input: InformedPeopleInput) => api.put('/api/v1/admin/requests/{publicId}/informed', { path: { publicId }, body: input }),
    onSuccess: (result) => {
      changed(result.data, result.message, 'The people to be informed are changed.');
    },
  });
}

/** Adds a box (id null) or changes one; the form's boxes are refreshed too. */
export function useSaveReviewerBox() {
  const api = useDnApi();
  const queryClient = useQueryClient();
  const notify = useNotify();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | null; input: ReviewerBoxInput }) =>
      id === null ? api.post('/api/v1/admin/reviewer-boxes', { body: input }) : api.put('/api/v1/admin/reviewer-boxes/{id}', { path: { id }, body: input }),
    onSuccess: (result, { id }) => {
      void queryClient.invalidateQueries({ queryKey: [...manageKeys.all, 'reviewer-boxes'] });
      void queryClient.invalidateQueries({ queryKey: requestKeys.boxes(result.data.changeCategoryId) });
      notify.success(result.message ?? (id === null ? 'The box is added.' : 'The box is changed.'));
    },
  });
}
