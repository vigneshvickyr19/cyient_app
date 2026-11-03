import { newIdempotencyKey } from '@cyient/api-client';
import type { InternalActionInput, InternalDetails, InternalInput, WorkflowActionInput } from '@cyient/api-client/cc';
import { useNotify } from '@cyient/shared-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCcApi } from '../../lib/api';
import { internalKeys } from './keys';

/** After a change: the internal complaint (with its new version) is stored and the lists are refreshed. */
function useInternalChanged() {
  const queryClient = useQueryClient();
  return (complaint: InternalDetails) => {
    queryClient.setQueryData(internalKeys.detail(complaint.publicId), complaint);
    void queryClient.invalidateQueries({ queryKey: internalKeys.lists() });
  };
}

/** Records an internal complaint; it is numbered at once. A retried click can't record two (Idempotency-Key). */
export function useCreateInternal() {
  const api = useCcApi();
  const changed = useInternalChanged();
  return useMutation({
    mutationFn: async (input: InternalInput) =>
      (await api.post('/api/v1/internal-complaints', { body: input, headers: { 'Idempotency-Key': newIdempotencyKey() } })).data,
    onSuccess: changed,
  });
}

export function useUpdateInternal(publicId: string) {
  const api = useCcApi();
  const changed = useInternalChanged();
  return useMutation({
    mutationFn: async (input: InternalInput) => (await api.put('/api/v1/internal-complaints/{publicId}', { path: { publicId }, body: input })).data,
    onSuccess: changed,
  });
}

/** Adds or changes a line of the action matrix. */
export function useSaveInternalAction(publicId: string) {
  const api = useCcApi();
  const changed = useInternalChanged();
  return useMutation({
    mutationFn: async ({ actionId, input }: { actionId: number | null; input: InternalActionInput }) =>
      (actionId === null
        ? await api.post('/api/v1/internal-complaints/{publicId}/actions', { path: { publicId }, body: input })
        : await api.put('/api/v1/internal-complaints/{publicId}/actions/{actionId}', { path: { publicId, actionId }, body: input })
      ).data,
    onSuccess: changed,
  });
}

export function useDeleteInternalAction(publicId: string) {
  const api = useCcApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (actionId: number) => api.delete('/api/v1/internal-complaints/{publicId}/actions/{actionId}', { path: { publicId, actionId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: internalKeys.detail(publicId) });
      void queryClient.invalidateQueries({ queryKey: internalKeys.lists() });
    },
  });
}

export function useCloseInternal(publicId: string) {
  const api = useCcApi();
  const notify = useNotify();
  const changed = useInternalChanged();
  return useMutation({
    mutationFn: (input: WorkflowActionInput) => api.post('/api/v1/internal-complaints/{publicId}/close', { path: { publicId }, body: input }),
    onSuccess: (result) => {
      changed(result.data);
      notify.success(result.message ?? 'The internal complaint is closed.');
    },
  });
}
