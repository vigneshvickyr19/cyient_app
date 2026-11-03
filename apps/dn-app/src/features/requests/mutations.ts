import { newIdempotencyKey } from '@cyient/api-client';
import type { ApproveInput, DraftDetails, RequestDetails, SerialsInput, WorkflowActionInput } from '@cyient/api-client/dn';
import { useNotify } from '@cyient/shared-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDnApi } from '../../lib/api';
import { requestKeys } from './keys';

/** After a change: the request's details (with the new version) are stored, and its lists and history are refreshed. */
function useRequestChanged() {
  const queryClient = useQueryClient();
  return (request: RequestDetails) => {
    queryClient.setQueryData(requestKeys.detail(request.publicId), request);
    void queryClient.invalidateQueries({ queryKey: requestKeys.history(request.publicId) });
    void queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: [...requestKeys.all, 'pending'] });
  };
}

/** Saves the form as a new draft; a retried click can't create two (Idempotency-Key). */
export function useCreateDraft() {
  const api = useDnApi();
  const changed = useRequestChanged();
  return useMutation({
    mutationFn: async (draft: DraftDetails) =>
      (await api.post('/api/v1/requests', { body: draft, headers: { 'Idempotency-Key': newIdempotencyKey() } })).data,
    onSuccess: changed,
  });
}

export function useUpdateDraft(publicId: string) {
  const api = useDnApi();
  const changed = useRequestChanged();
  return useMutation({
    mutationFn: async (draft: DraftDetails) => (await api.put('/api/v1/requests/{publicId}', { path: { publicId }, body: draft })).data,
    onSuccess: changed,
  });
}

export type ReviewStep = 'update' | 'reject' | 'more-details';

/** Submit or resubmit, the reviewer actions, and the HOD's approve with its "further approval required" answer. */
export type WorkflowCall =
  | { step: 'submit' | ReviewStep; input: WorkflowActionInput }
  | { step: 'approve'; input: ApproveInput };

export type WorkflowStep = WorkflowCall['step'];

/** Every action sends the comment and the version the user saw; a stale version gets 409. */
export function useWorkflowAction(publicId: string) {
  const api = useDnApi();
  const notify = useNotify();
  const changed = useRequestChanged();
  return useMutation({
    mutationFn: (call: WorkflowCall) => {
      const path = { publicId };
      switch (call.step) {
        case 'submit':
          return api.post('/api/v1/requests/{publicId}/submit', { path, body: call.input });
        case 'update':
          return api.post('/api/v1/requests/{publicId}/update', { path, body: call.input });
        case 'approve':
          return api.post('/api/v1/requests/{publicId}/approve', { path, body: call.input });
        case 'reject':
          return api.post('/api/v1/requests/{publicId}/reject', { path, body: call.input });
        case 'more-details':
          return api.post('/api/v1/requests/{publicId}/more-details', { path, body: call.input });
      }
    },
    onSuccess: (result) => {
      changed(result.data);
      notify.success(result.message ?? 'Done.');
    },
  });
}

/** The production supervisor's serial range of an approved deviation. */
export function useUpdateSerials(publicId: string) {
  const api = useDnApi();
  const notify = useNotify();
  const changed = useRequestChanged();
  return useMutation({
    mutationFn: (input: SerialsInput) => api.post('/api/v1/requests/{publicId}/serials', { path: { publicId }, body: input }),
    onSuccess: (result) => {
      changed(result.data);
      notify.success(result.message ?? 'The serial range is saved.');
    },
  });
}

/** Adds a document; the same file name again becomes a new version. The request's version changes with it. */
export function useUploadDocument(publicId: string) {
  const api = useDnApi();
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
