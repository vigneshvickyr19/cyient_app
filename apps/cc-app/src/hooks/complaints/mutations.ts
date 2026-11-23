import type { ApiResult } from '@cyient/api-client';
import type {
  ActionInput,
  CloseActionInput,
  ComplaintDetails,
  ComplaintInput,
  ContainmentInput,
  RootCauseInput,
  StepInput,
  WorkflowActionInput,
} from '@cyient/api-client/cc';
import { platformTags, toastMeta } from '@cyient/shared-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ccTags } from '@/api-callers/api-tags';
import { closeAction, deleteAction, saveAction, uploadEvidence } from '@/api-callers/complaints/action.api';
import {
  createComplaint,
  runWorkflowStep,
  saveRootCause,
  saveStep,
  updateComplaint,
  type TextStep,
  type WorkflowStep,
} from '@/api-callers/complaints/complaint.api';
import { deleteContainment, saveContainment } from '@/api-callers/complaints/containment.api';
import { uploadComplaintDocument } from '@/api-callers/complaints/document.api';
import { useCcApi } from '@/hooks/useCcApi';

/**
 * After a change: the complaint's details (with the new version) are stored, and its lists, log, pending actions and
 * the Pending Actions count are refreshed.
 */
function useComplaintChanged() {
  const queryClient = useQueryClient();
  return (complaint: ComplaintDetails) => {
    queryClient.setQueryData(ccTags.complaint.detail(complaint.publicId), complaint);
    void queryClient.invalidateQueries({ queryKey: ccTags.complaint.log(complaint.publicId) });
    void queryClient.invalidateQueries({ queryKey: ccTags.complaint.lists() });
    void queryClient.invalidateQueries({ queryKey: ccTags.complaint.pendingAll() });
    void queryClient.invalidateQueries({ queryKey: platformTags.me() });
  };
}

/** A change that answers without the complaint (a line, a file): the complaint is read again for its new version. */
function useComplaintStale(publicId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ccTags.complaint.detail(publicId) });
}

/** Saves the first page as a draft. */
export function useCreateComplaint() {
  const api = useCcApi();
  const changed = useComplaintChanged();
  return useMutation({
    meta: toastMeta({ success: 'Draft saved. Only you can see it until it is published.', error: 'The complaint could not be saved.' }),
    mutationFn: (input: ComplaintInput) => createComplaint(api, input),
    onSuccess: changed,
  });
}

export function useUpdateComplaint(publicId: string) {
  const api = useCcApi();
  const changed = useComplaintChanged();
  return useMutation({
    meta: toastMeta({ success: 'Changes saved.', error: 'The complaint could not be saved.' }),
    mutationFn: (input: ComplaintInput) => updateComplaint(api, publicId, input),
    onSuccess: changed,
  });
}

const stepSaved: Record<TextStep, string> = {
  verification: 'D6 Verification saved.',
  horizontalDeployment: 'D7 Horizontal Deployment saved.',
  closure: 'D8 Closure saved.',
};

const done: Record<WorkflowStep, (complaint: ComplaintDetails) => string> = {
  publish: (complaint) => `Published as ${complaint.complaintNo ?? 'a complaint'}. The team is emailed and D4 is open.`,
  completeActionPlan: () => 'The action plan is complete. D6 is open.',
  close: () => 'The complaint is closed.',
};

/** Publish, complete the action plan (D5) or close, with the comment and the version the user saw. */
export function useWorkflowAction(publicId: string) {
  const api = useCcApi();
  const changed = useComplaintChanged();
  return useMutation({
    meta: toastMeta<ApiResult<ComplaintDetails>, { step: WorkflowStep }>({ success: (result, { step }) => done[step](result.data) }),
    mutationFn: ({ step, input }: { step: WorkflowStep; input: WorkflowActionInput }) => runWorkflowStep(api, publicId, step, input),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}

/** D4: the why-why analysis; the first save opens D5. */
export function useSaveRootCause(publicId: string) {
  const api = useCcApi();
  const changed = useComplaintChanged();
  return useMutation({
    meta: toastMeta({ success: 'Root cause saved.' }),
    mutationFn: (input: RootCauseInput) => saveRootCause(api, publicId, input),
    onSuccess: changed,
  });
}

/** D6, D7 or D8; saving the open step opens the next one, and saving D8 sends the complaint to the initiator. */
export function useSaveStep(publicId: string, step: TextStep) {
  const api = useCcApi();
  const changed = useComplaintChanged();
  return useMutation({
    meta: toastMeta({ success: stepSaved[step] }),
    mutationFn: (input: StepInput) => saveStep(api, publicId, step, input),
    onSuccess: changed,
  });
}

/** Adds or changes a containment action (D3); no email is sent. */
export function useSaveContainment(publicId: string) {
  const api = useCcApi();
  const stale = useComplaintStale(publicId);
  return useMutation({
    meta: toastMeta<unknown, { lineId: number | null }>({ success: (_, { lineId }) => (lineId === null ? 'Containment action added.' : 'Containment action changed.') }),
    mutationFn: ({ lineId, input }: { lineId: number | null; input: ContainmentInput }) => saveContainment(api, publicId, lineId, input),
    onSuccess: stale,
  });
}

export function useDeleteContainment(publicId: string) {
  const api = useCcApi();
  const stale = useComplaintStale(publicId);
  return useMutation({
    meta: toastMeta({ success: 'Containment action deleted.' }),
    mutationFn: (lineId: number) => deleteContainment(api, publicId, lineId),
    onSuccess: stale,
  });
}

/** Adds or changes a D5 action; its (new) owner is emailed. */
export function useSaveAction(publicId: string) {
  const api = useCcApi();
  const changed = useComplaintChanged();
  return useMutation({
    meta: toastMeta<unknown, { actionId: number | null }>({ success: (_, { actionId }) => (actionId === null ? 'Action added. Its owner is emailed.' : 'Action changed.') }),
    mutationFn: ({ actionId, input }: { actionId: number | null; input: ActionInput }) => saveAction(api, publicId, actionId, input),
    onSuccess: changed,
  });
}

export function useDeleteAction(publicId: string) {
  const api = useCcApi();
  const queryClient = useQueryClient();
  return useMutation({
    meta: toastMeta({ success: 'Action deleted.' }),
    mutationFn: (actionId: number) => deleteAction(api, publicId, actionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ccTags.complaint.detail(publicId) });
      void queryClient.invalidateQueries({ queryKey: platformTags.me() });
    },
  });
}

/** The owner adds evidence to their open action; the same file name again becomes a new version. */
export function useUploadEvidence(publicId: string) {
  const api = useCcApi();
  const stale = useComplaintStale(publicId);
  return useMutation({
    meta: toastMeta<ApiResult<{ fileName: string }>>({ success: (result) => `${result.data.fileName} uploaded.`, error: 'The evidence could not be uploaded.' }),
    mutationFn: ({ actionId, file }: { actionId: number; file: File }) => uploadEvidence(api, publicId, actionId, file),
    onSuccess: async () => {
      await stale();
    },
  });
}

/** The owner closes their action (it needs evidence); the initiator is emailed. */
export function useCloseAction(publicId: string) {
  const api = useCcApi();
  const changed = useComplaintChanged();
  return useMutation({
    meta: toastMeta({ success: 'Action closed. The initiator is emailed.' }),
    mutationFn: ({ actionId, input }: { actionId: number; input: CloseActionInput }) => closeAction(api, publicId, actionId, input),
    onSuccess: changed,
  });
}

/** Adds a first-page document (an evidence image or file); the same file name again becomes a new version. */
export function useUploadDocument(publicId: string) {
  const api = useCcApi();
  const queryClient = useQueryClient();
  return useMutation({
    meta: toastMeta<ApiResult<{ fileName: string }>>({ success: (result) => `${result.data.fileName} uploaded.`, error: 'The document could not be uploaded.' }),
    mutationFn: (file: File) => uploadComplaintDocument(api, publicId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ccTags.complaint.detail(publicId) });
    },
  });
}
