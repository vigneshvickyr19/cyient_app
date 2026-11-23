import type { ApiResult } from '@cyient/api-client';
import { toastMeta } from '@cyient/shared-ui';
import type { ClauseInput, DraftDetails, ReleaseInput, RequestDetails, WorkflowActionInput } from '@cyient/api-client/dcr';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dcrTags } from '@/api-callers/api-tags';
import { deleteClause, saveClause } from '@/api-callers/requests/clause.api';
import { uploadRequestDocument } from '@/api-callers/requests/document.api';
import { createDraft, releaseRequest, runWorkflowStep, updateDraft, type WorkflowStep } from '@/api-callers/requests/request.api';
import { useDcrApi } from '@/hooks/useDcrApi';

/** After a change: the request's details (with the new version) are stored, and its lists and log are refreshed. */
function useRequestChanged() {
  const queryClient = useQueryClient();
  return (request: RequestDetails) => {
    queryClient.setQueryData(dcrTags.request.detail(request.publicId), request);
    void queryClient.invalidateQueries({ queryKey: dcrTags.request.log(request.publicId) });
    void queryClient.invalidateQueries({ queryKey: dcrTags.request.lists() });
    void queryClient.invalidateQueries({ queryKey: dcrTags.request.pendingAll() });
  };
}

/** Saves the New Request form as a draft. */
export function useCreateDraft() {
  const api = useDcrApi();
  const changed = useRequestChanged();
  return useMutation({
    meta: toastMeta({ success: 'Draft saved. Add the clause lines and the document, then submit it.', error: 'The request could not be saved.' }),
    mutationFn: (draft: DraftDetails) => createDraft(api, draft),
    onSuccess: changed,
  });
}

export function useUpdateDraft(publicId: string) {
  const api = useDcrApi();
  const changed = useRequestChanged();
  return useMutation({
    meta: toastMeta({ success: 'Changes saved.', error: 'The request could not be saved.' }),
    mutationFn: (draft: DraftDetails) => updateDraft(api, publicId, draft),
    onSuccess: changed,
  });
}

/** Submit, approve, send back or reject, with the comment and the version the user saw. */
export function useWorkflowAction(publicId: string) {
  const api = useDcrApi();
  const changed = useRequestChanged();
  return useMutation({
    mutationFn: ({ step, input }: { step: WorkflowStep; input: WorkflowActionInput }) => runWorkflowStep(api, publicId, step, input),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}

export function useRelease(publicId: string) {
  const api = useDcrApi();
  const changed = useRequestChanged();
  return useMutation({
    meta: toastMeta({ success: 'The document is released.' }),
    mutationFn: (input: ReleaseInput) => releaseRequest(api, publicId, input),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}

/** Clause lines change the request's version, so the request is read again after each. */
function useClauseChanged(publicId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: dcrTags.request.detail(publicId), exact: true });
}

export function useSaveClause(publicId: string) {
  const api = useDcrApi();
  const changed = useClauseChanged(publicId);
  return useMutation({
    meta: toastMeta<unknown, { clauseId: number | null }>({ success: (_, { clauseId }) => (clauseId === null ? 'Clause line added.' : 'Clause line changed.') }),
    mutationFn: ({ clauseId, input }: { clauseId: number | null; input: ClauseInput }) => saveClause(api, publicId, clauseId, input),
    onSuccess: changed,
  });
}

export function useDeleteClause(publicId: string) {
  const api = useDcrApi();
  const changed = useClauseChanged(publicId);
  return useMutation({
    meta: toastMeta({ success: 'Clause line deleted.' }),
    mutationFn: (clauseId: number) => deleteClause(api, publicId, clauseId),
    onSuccess: changed,
  });
}

/** Adds a document to the draft; the same file name again becomes a new version. */
export function useUploadDocument(publicId: string) {
  const api = useDcrApi();
  const queryClient = useQueryClient();
  return useMutation({
    meta: toastMeta<ApiResult<{ fileName: string }>>({ success: (result) => `${result.data.fileName} uploaded.`, error: 'The document could not be uploaded.' }),
    mutationFn: (file: File) => uploadRequestDocument(api, publicId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dcrTags.request.detail(publicId) });
    },
  });
}
