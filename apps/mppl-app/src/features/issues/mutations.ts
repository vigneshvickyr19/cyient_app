import type { IssueDetails, IssueInput, WorkflowActionInput } from '@cyient/api-client/mppl';
import { useAuth, useNotify } from '@cyient/shared-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMpplApi } from '../../lib/api';
import { issueKeys } from './keys';

/** After a change: the issue's details (with the new version) are stored, and its log, the lists and pending are refreshed. */
function useIssueChanged() {
  const queryClient = useQueryClient();
  return (issue: IssueDetails) => {
    queryClient.setQueryData(issueKeys.detail(issue.publicId), issue);
    void queryClient.invalidateQueries({ queryKey: issueKeys.log(issue.publicId) });
    void queryClient.invalidateQueries({ queryKey: issueKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: [...issueKeys.all, 'pending'] });
  };
}

/**
 * Saves the New Issue form as a draft. The form keeps one Idempotency-Key, so saving again after a lost answer
 * returns the same draft instead of a second one.
 */
export function useCreateDraft(idempotencyKey: string) {
  const api = useMpplApi();
  const changed = useIssueChanged();
  return useMutation({
    mutationFn: async (input: IssueInput) => (await api.post('/api/v1/issues', { body: input, headers: { 'Idempotency-Key': idempotencyKey } })).data,
    onSuccess: changed,
  });
}

export function useUpdateDraft(publicId: string) {
  const api = useMpplApi();
  const changed = useIssueChanged();
  return useMutation({
    mutationFn: async (input: IssueInput) => (await api.put('/api/v1/issues/{publicId}', { path: { publicId }, body: input })).data,
    onSuccess: changed,
  });
}

export type IssueStep = 'submit' | 'close';

/** Submit (the buyer) or close (the Sourcing Lead), with the comment and the version the user saw. */
export function useIssueAction(publicId: string) {
  const api = useMpplApi();
  const notify = useNotify();
  const { refresh } = useAuth();
  const changed = useIssueChanged();
  return useMutation({
    mutationFn: ({ step, input }: { step: IssueStep; input: WorkflowActionInput }) =>
      step === 'submit'
        ? api.post('/api/v1/issues/{publicId}/submit', { path: { publicId }, body: input })
        : api.post('/api/v1/issues/{publicId}/close', { path: { publicId }, body: input }),
    onSuccess: (result, { step }) => {
      changed(result.data);
      // Closing changes the Sourcing Lead's pending count in the navigation
      if (step === 'close') refresh();
      notify.success(result.message ?? (step === 'submit' ? 'The issue is submitted and the Sourcing Lead is emailed.' : 'The issue is closed and the buyer is emailed.'));
    },
  });
}

/** Adds a reference document to the draft; the same file name again becomes a new version. */
export function useUploadDocument(publicId: string) {
  const api = useMpplApi();
  const queryClient = useQueryClient();
  const notify = useNotify();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api.post('/api/v1/issues/{publicId}/documents', { path: { publicId }, body: form });
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: issueKeys.detail(publicId) });
      notify.success(result.message ?? `${result.data.fileName} uploaded.`);
    },
    onError: (error) => {
      notify.error(error, 'The document could not be uploaded.');
    },
  });
}
