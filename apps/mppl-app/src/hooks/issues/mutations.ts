import type { ApiResult } from '@cyient/api-client';
import type { IssueDetails, IssueInput, WorkflowActionInput } from '@cyient/api-client/mppl';
import { toastMeta, useAuth } from '@cyient/shared-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mpplTags } from '@/api-callers/api-tags';
import { uploadIssueDocument } from '@/api-callers/issues/document.api';
import { createDraft, runIssueStep, updateDraft, type IssueStep } from '@/api-callers/issues/issue.api';
import { useMpplApi } from '@/hooks/useMpplApi';

/** After a change: the issue's details (with the new version) are stored, and its log, the lists and pending are refreshed. */
function useIssueChanged() {
  const queryClient = useQueryClient();
  return (issue: IssueDetails) => {
    queryClient.setQueryData(mpplTags.issue.detail(issue.publicId), issue);
    void queryClient.invalidateQueries({ queryKey: mpplTags.issue.log(issue.publicId) });
    void queryClient.invalidateQueries({ queryKey: mpplTags.issue.lists() });
    void queryClient.invalidateQueries({ queryKey: mpplTags.issue.pendingAll() });
  };
}

/** Saves the New Issue form as a draft; the form's one Idempotency-Key makes a repeated save return the same draft. */
export function useCreateDraft(idempotencyKey: string) {
  const api = useMpplApi();
  const changed = useIssueChanged();
  return useMutation({
    meta: toastMeta({ success: 'Draft saved. Add the reference documents, then submit it.', error: 'The issue could not be saved.' }),
    mutationFn: (input: IssueInput) => createDraft(api, input, idempotencyKey),
    onSuccess: changed,
  });
}

export function useUpdateDraft(publicId: string) {
  const api = useMpplApi();
  const changed = useIssueChanged();
  return useMutation({
    meta: toastMeta({ success: 'Changes saved.', error: 'The issue could not be saved.' }),
    mutationFn: (input: IssueInput) => updateDraft(api, publicId, input),
    onSuccess: changed,
  });
}

/** Submit (the buyer) or close (the Sourcing Lead), with the comment and the version the user saw. */
export function useIssueAction(publicId: string) {
  const api = useMpplApi();
  const { refresh } = useAuth();
  const changed = useIssueChanged();
  return useMutation({
    meta: toastMeta<unknown, { step: IssueStep }>({ success: (_, { step }) => (step === 'submit' ? 'The issue is submitted and the Sourcing Lead is emailed.' : 'The issue is closed and the buyer is emailed.') }),
    mutationFn: ({ step, input }: { step: IssueStep; input: WorkflowActionInput }) => runIssueStep(api, publicId, step, input),
    onSuccess: (result, { step }) => {
      changed(result.data);
      // Closing changes the Sourcing Lead's pending count in the navigation
      if (step === 'close') refresh();
    },
  });
}

/** Adds a reference document to the draft; the same file name again becomes a new version. */
export function useUploadDocument(publicId: string) {
  const api = useMpplApi();
  const queryClient = useQueryClient();
  return useMutation({
    meta: toastMeta<ApiResult<{ fileName: string }>>({ success: (result) => `${result.data.fileName} uploaded.`, error: 'The document could not be uploaded.' }),
    mutationFn: (file: File) => uploadIssueDocument(api, publicId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mpplTags.issue.detail(publicId) });
    },
  });
}
