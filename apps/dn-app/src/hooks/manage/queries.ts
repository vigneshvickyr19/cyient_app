import type { AddReviewerInput, AdminActionInput, ChangeReviewerInput, InformedPeopleInput, RequestDetails, ReviewerBoxInput } from '@cyient/api-client/dn';
import { type RecordHistoryTabsProps, toastMeta } from '@cyient/shared-ui';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dnTags } from '@/api-callers/api-tags';
import { listAdminReviewerBoxes, saveReviewerBox } from '@/api-callers/manage/admin-reviewer-box.api';
import {
  addReviewer,
  changeReviewer,
  closeRequest,
  getAdminRequestHistory,
  listAdminRequests,
  listRequestAudit,
  listRequestEmails,
  removeReviewer,
  setInformedPeople,
} from '@/api-callers/manage/admin-request.api';
import { listOpenTasks } from '@/api-callers/manage/task.api';
import { useDnApi } from '@/hooks/useDnApi';
import type { RequestListQuery, TaskQuery } from '@/types/requests';

/** Open tasks: who each deviation is pending with, longest waiting first. */
export function useOpenTasks(query: TaskQuery) {
  const api = useDnApi();
  return useQuery({
    queryKey: dnTags.manage.tasks(query),
    queryFn: ({ signal }) => listOpenTasks(api, query, signal),
    placeholderData: keepPreviousData,
  });
}

/** Every deviation, drafts included. */
export function useAdminRequests(query: RequestListQuery) {
  const api = useDnApi();
  return useQuery({
    queryKey: dnTags.manage.requests(query),
    queryFn: ({ signal }) => listAdminRequests(api, query, signal),
    placeholderData: keepPreviousData,
  });
}

/** The deviation's history, emails and audit trail, for its Record tabs. */
export function useRequestRecord(publicId: string): Pick<RecordHistoryTabsProps, 'loaders' | 'queryKey'> {
  const api = useDnApi();
  return {
    queryKey: dnTags.manage.record(publicId),
    loaders: {
      history: ({ signal }) => getAdminRequestHistory(api, publicId, signal),
      emails: ({ page, pageSize, signal }) => listRequestEmails(api, publicId, page, pageSize, signal),
      audit: ({ page, pageSize, signal }) => listRequestAudit(api, publicId, page, pageSize, signal),
    },
  };
}

/** A change category's boxes, switched-off ones included, for IT's maintenance. */
export function useAdminReviewerBoxes(changeCategoryId: number | null) {
  const api = useDnApi();
  return useQuery({
    queryKey: dnTags.manage.boxes(changeCategoryId ?? 0),
    queryFn: ({ signal }) => listAdminReviewerBoxes(api, changeCategoryId, signal),
    enabled: changeCategoryId !== null,
  });
}

/** After an administrator's change, every view of deviations and tasks is out of date; the new details are kept. */
function useManageChanged() {
  const queryClient = useQueryClient();
  return (request: RequestDetails) => {
    queryClient.setQueryData(dnTags.request.detail(request.publicId), request);
    void queryClient.invalidateQueries({ queryKey: dnTags.manage.all });
    void queryClient.invalidateQueries({ queryKey: dnTags.request.all });
  };
}

export function useCloseRequest(publicId: string) {
  const api = useDnApi();
  const changed = useManageChanged();
  return useMutation({
    meta: toastMeta({ success: 'The deviation is closed. Nobody is emailed.' }),
    mutationFn: (input: AdminActionInput) => closeRequest(api, publicId, input),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}

export function useAddReviewer(publicId: string) {
  const api = useDnApi();
  const changed = useManageChanged();
  return useMutation({
    meta: toastMeta({ success: 'The reviewer is added.' }),
    mutationFn: (input: AddReviewerInput) => addReviewer(api, publicId, input),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}

export function useChangeReviewer(publicId: string) {
  const api = useDnApi();
  const changed = useManageChanged();
  return useMutation({
    meta: toastMeta({ success: 'The step has its new person.' }),
    mutationFn: ({ reviewerId, input }: { reviewerId: number; input: ChangeReviewerInput }) => changeReviewer(api, publicId, reviewerId, input),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}

export function useRemoveReviewer(publicId: string) {
  const api = useDnApi();
  const changed = useManageChanged();
  return useMutation({
    meta: toastMeta({ success: 'The step is removed.' }),
    mutationFn: ({ reviewerId, input }: { reviewerId: number; input: AdminActionInput }) => removeReviewer(api, publicId, reviewerId, input),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}

export function useSetInformedPeople(publicId: string) {
  const api = useDnApi();
  const changed = useManageChanged();
  return useMutation({
    meta: toastMeta({ success: 'The people to be informed are changed.' }),
    mutationFn: (input: InformedPeopleInput) => setInformedPeople(api, publicId, input),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}

/** Adds a box (id null) or changes one; the form's boxes are refreshed too. */
export function useSaveReviewerBox() {
  const api = useDnApi();
  const queryClient = useQueryClient();
  return useMutation({
    meta: toastMeta<unknown, { id: number | null }>({ success: (_, { id }) => (id === null ? 'The box is added.' : 'The box is changed.') }),
    mutationFn: ({ id, input }: { id: number | null; input: ReviewerBoxInput }) => saveReviewerBox(api, id, input),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: dnTags.manage.boxesAll() });
      void queryClient.invalidateQueries({ queryKey: dnTags.request.boxes(result.data.changeCategoryId) });
    },
  });
}
