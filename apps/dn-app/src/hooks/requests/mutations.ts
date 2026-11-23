import type { ApiResult } from '@cyient/api-client';
import { toastMeta } from '@cyient/shared-ui';
import type { DraftDetails, RequestDetails, SerialsInput } from '@cyient/api-client/dn';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dnTags } from '@/api-callers/api-tags';
import { uploadRequestDocument } from '@/api-callers/requests/document.api';
import { createDraft, runWorkflowStep, updateDraft, updateSerials, type WorkflowCall } from '@/api-callers/requests/request.api';
import { useDnApi } from '@/hooks/useDnApi';

/** After a change: the request's details (with the new version) are stored, and its lists and history are refreshed. */
function useRequestChanged() {
  const queryClient = useQueryClient();
  return (request: RequestDetails) => {
    queryClient.setQueryData(dnTags.request.detail(request.publicId), request);
    void queryClient.invalidateQueries({ queryKey: dnTags.request.history(request.publicId) });
    void queryClient.invalidateQueries({ queryKey: dnTags.request.lists() });
    void queryClient.invalidateQueries({ queryKey: dnTags.request.pendingAll() });
  };
}

/** Saves the form as a new draft. */
export function useCreateDraft() {
  const api = useDnApi();
  const changed = useRequestChanged();
  return useMutation({
    meta: toastMeta({ success: 'Draft saved. Add any reference documents, then submit it.', error: 'The deviation could not be saved.' }),
    mutationFn: (draft: DraftDetails) => createDraft(api, draft),
    onSuccess: changed,
  });
}

export function useUpdateDraft(publicId: string) {
  const api = useDnApi();
  const changed = useRequestChanged();
  return useMutation({
    meta: toastMeta({ success: 'Changes saved.', error: 'The deviation could not be saved.' }),
    mutationFn: (draft: DraftDetails) => updateDraft(api, publicId, draft),
    onSuccess: changed,
  });
}

/** Every action sends the comment and the version the user saw; a stale version gets 409. */
export function useWorkflowAction(publicId: string) {
  const api = useDnApi();
  const changed = useRequestChanged();
  return useMutation({
    mutationFn: (call: WorkflowCall) => runWorkflowStep(api, publicId, call),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}

/** The production supervisor's serial range of an approved deviation. */
export function useUpdateSerials(publicId: string) {
  const api = useDnApi();
  const changed = useRequestChanged();
  return useMutation({
    meta: toastMeta({ success: 'The serial range is saved.' }),
    mutationFn: (input: SerialsInput) => updateSerials(api, publicId, input),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}

/** Adds a document; the same file name again becomes a new version. The request's version changes with it. */
export function useUploadDocument(publicId: string) {
  const api = useDnApi();
  const queryClient = useQueryClient();
  return useMutation({
    meta: toastMeta<ApiResult<{ fileName: string }>>({ success: (result) => `${result.data.fileName} uploaded.`, error: 'The document could not be uploaded.' }),
    mutationFn: (file: File) => uploadRequestDocument(api, publicId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dnTags.request.detail(publicId) });
    },
  });
}
