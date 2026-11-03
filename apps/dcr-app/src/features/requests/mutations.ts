import { newIdempotencyKey } from '@cyient/api-client';
import type { ClauseInput, DraftDetails, ReleaseInput, RequestDetails, WorkflowActionInput } from '@cyient/api-client/dcr';
import { useNotify } from '@cyient/shared-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDcrApi } from '../../lib/api';
import { requestKeys } from './keys';

/** After a change: the request's details (with the new version) are stored, and its lists and log are refreshed. */
function useRequestChanged() {
  const queryClient = useQueryClient();
  return (request: RequestDetails) => {
    queryClient.setQueryData(requestKeys.detail(request.publicId), request);
    void queryClient.invalidateQueries({ queryKey: requestKeys.log(request.publicId) });
    void queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: [...requestKeys.all, 'pending'] });
  };
}

/** Saves the New Request form as a draft; a retried click can't create two (Idempotency-Key). */
export function useCreateDraft() {
  const api = useDcrApi();
  const changed = useRequestChanged();
  return useMutation({
    mutationFn: async (draft: DraftDetails) =>
      (await api.post('/api/v1/requests', { body: draft, headers: { 'Idempotency-Key': newIdempotencyKey() } })).data,
    onSuccess: changed,
  });
}

export function useUpdateDraft(publicId: string) {
  const api = useDcrApi();
  const changed = useRequestChanged();
  return useMutation({
    mutationFn: async (draft: DraftDetails) => (await api.put('/api/v1/requests/{publicId}', { path: { publicId }, body: draft })).data,
    onSuccess: changed,
  });
}

export type WorkflowStep = 'submit' | 'approve' | 'revert' | 'reject';

/** Submit, approve, send back or reject, with the comment and the version the user saw. */
export function useWorkflowAction(publicId: string) {
  const api = useDcrApi();
  const notify = useNotify();
  const changed = useRequestChanged();
  return useMutation({
    mutationFn: async ({ step, input }: { step: WorkflowStep; input: WorkflowActionInput }) => {
      const options = { path: { publicId }, body: input };
      switch (step) {
        case 'submit':
          return api.post('/api/v1/requests/{publicId}/submit', options);
        case 'approve':
          return api.post('/api/v1/requests/{publicId}/approve', options);
        case 'revert':
          return api.post('/api/v1/requests/{publicId}/revert', options);
        case 'reject':
          return api.post('/api/v1/requests/{publicId}/reject', options);
      }
    },
    onSuccess: (result) => {
      changed(result.data);
      notify.success(result.message ?? 'Done.');
    },
  });
}

export function useRelease(publicId: string) {
  const api = useDcrApi();
  const notify = useNotify();
  const changed = useRequestChanged();
  return useMutation({
    mutationFn: (input: ReleaseInput) => api.post('/api/v1/requests/{publicId}/release', { path: { publicId }, body: input }),
    onSuccess: (result) => {
      changed(result.data);
      notify.success(result.message ?? 'The document is released.');
    },
  });
}

/** Clause lines change the request's version, so the request is read again after each. */
function useClauseChanged(publicId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: requestKeys.detail(publicId), exact: true });
}

export function useSaveClause(publicId: string) {
  const api = useDcrApi();
  const changed = useClauseChanged(publicId);
  return useMutation({
    mutationFn: ({ clauseId, input }: { clauseId: number | null; input: ClauseInput }) =>
      clauseId === null
        ? api.post('/api/v1/requests/{publicId}/clauses', { path: { publicId }, body: input })
        : api.put('/api/v1/requests/{publicId}/clauses/{clauseId}', { path: { publicId, clauseId }, body: input }),
    onSuccess: changed,
  });
}

export function useDeleteClause(publicId: string) {
  const api = useDcrApi();
  const changed = useClauseChanged(publicId);
  return useMutation({
    mutationFn: (clauseId: number) => api.delete('/api/v1/requests/{publicId}/clauses/{clauseId}', { path: { publicId, clauseId } }),
    onSuccess: changed,
  });
}

/** Adds a document to the draft; the same file name again becomes a new version. */
export function useUploadDocument(publicId: string) {
  const api = useDcrApi();
  const queryClient = useQueryClient();
  const notify = useNotify();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api.post('/api/v1/requests/{publicId}/documents', { path: { publicId }, body: form });
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: requestKeys.detail(publicId) });
      notify.success(result.message ?? `${result.data.fileName} uploaded.`);
    },
    onError: (error) => {
      notify.error(error, 'The document could not be uploaded.');
    },
  });
}
