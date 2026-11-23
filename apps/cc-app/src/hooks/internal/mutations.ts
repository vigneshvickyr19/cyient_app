import { toastMeta } from '@cyient/shared-ui';
import type { InternalActionInput, InternalDetails, InternalInput, WorkflowActionInput } from '@cyient/api-client/cc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ccTags } from '@/api-callers/api-tags';
import { deleteInternalAction, saveInternalAction } from '@/api-callers/internal/internal-action.api';
import { closeInternalComplaint, createInternalComplaint, updateInternalComplaint } from '@/api-callers/internal/internal-complaint.api';
import { useCcApi } from '@/hooks/useCcApi';

/** After a change: the internal complaint (with its new version) is stored and the lists are refreshed. */
function useInternalChanged() {
  const queryClient = useQueryClient();
  return (complaint: InternalDetails) => {
    queryClient.setQueryData(ccTags.internal.detail(complaint.publicId), complaint);
    void queryClient.invalidateQueries({ queryKey: ccTags.internal.lists() });
  };
}

/** Records an internal complaint; it is numbered at once. */
export function useCreateInternal() {
  const api = useCcApi();
  const changed = useInternalChanged();
  return useMutation({
    meta: toastMeta<InternalDetails>({ success: (complaint) => `Recorded as ${complaint.complaintNo}. Add its actions.`, error: 'The internal complaint could not be saved.' }),
    mutationFn: (input: InternalInput) => createInternalComplaint(api, input),
    onSuccess: changed,
  });
}

export function useUpdateInternal(publicId: string) {
  const api = useCcApi();
  const changed = useInternalChanged();
  return useMutation({
    meta: toastMeta({ success: 'Changes saved.', error: 'The internal complaint could not be saved.' }),
    mutationFn: (input: InternalInput) => updateInternalComplaint(api, publicId, input),
    onSuccess: changed,
  });
}

/** Adds or changes a line of the action matrix. */
export function useSaveInternalAction(publicId: string) {
  const api = useCcApi();
  const changed = useInternalChanged();
  return useMutation({
    meta: toastMeta<unknown, { actionId: number | null }>({ success: (_, { actionId }) => (actionId === null ? 'Action added.' : 'Action changed.') }),
    mutationFn: ({ actionId, input }: { actionId: number | null; input: InternalActionInput }) => saveInternalAction(api, publicId, actionId, input),
    onSuccess: changed,
  });
}

export function useDeleteInternalAction(publicId: string) {
  const api = useCcApi();
  const queryClient = useQueryClient();
  return useMutation({
    meta: toastMeta({ success: 'Action deleted.' }),
    mutationFn: (actionId: number) => deleteInternalAction(api, publicId, actionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ccTags.internal.detail(publicId) });
      void queryClient.invalidateQueries({ queryKey: ccTags.internal.lists() });
    },
  });
}

export function useCloseInternal(publicId: string) {
  const api = useCcApi();
  const changed = useInternalChanged();
  return useMutation({
    meta: toastMeta({ success: 'The internal complaint is closed.' }),
    mutationFn: (input: WorkflowActionInput) => closeInternalComplaint(api, publicId, input),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}
