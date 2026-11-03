import { newIdempotencyKey } from '@cyient/api-client';
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
import { platformKeys, useNotify } from '@cyient/shared-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCcApi } from '../../lib/api';
import { complaintKeys } from './keys';

/**
 * After a change: the complaint's details (with the new version) are stored, and its lists, log, pending actions and
 * the Pending Actions count are refreshed.
 */
function useComplaintChanged() {
  const queryClient = useQueryClient();
  return (complaint: ComplaintDetails) => {
    queryClient.setQueryData(complaintKeys.detail(complaint.publicId), complaint);
    void queryClient.invalidateQueries({ queryKey: complaintKeys.log(complaint.publicId) });
    void queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: [...complaintKeys.all, 'pending'] });
    void queryClient.invalidateQueries({ queryKey: platformKeys.me() });
  };
}

/** A change that answers without the complaint (a line, a file): the complaint is read again for its new version. */
function useComplaintStale(publicId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: complaintKeys.detail(publicId) });
}

/** Saves the first page as a draft; a retried click can't create two (Idempotency-Key). */
export function useCreateComplaint() {
  const api = useCcApi();
  const changed = useComplaintChanged();
  return useMutation({
    mutationFn: async (input: ComplaintInput) =>
      (await api.post('/api/v1/complaints', { body: input, headers: { 'Idempotency-Key': newIdempotencyKey() } })).data,
    onSuccess: changed,
  });
}

export function useUpdateComplaint(publicId: string) {
  const api = useCcApi();
  const changed = useComplaintChanged();
  return useMutation({
    mutationFn: async (input: ComplaintInput) => (await api.put('/api/v1/complaints/{publicId}', { path: { publicId }, body: input })).data,
    onSuccess: changed,
  });
}

export type WorkflowStep = 'publish' | 'completeActionPlan' | 'close';

const done: Record<WorkflowStep, (complaint: ComplaintDetails) => string> = {
  publish: (complaint) => `Published as ${complaint.complaintNo ?? 'a complaint'}. The team is emailed and D4 is open.`,
  completeActionPlan: () => 'The action plan is complete. D6 is open.',
  close: () => 'The complaint is closed.',
};

/** Publish, complete the action plan (D5) or close, with the comment and the version the user saw. */
export function useWorkflowAction(publicId: string) {
  const api = useCcApi();
  const notify = useNotify();
  const changed = useComplaintChanged();
  return useMutation({
    mutationFn: async ({ step, input }: { step: WorkflowStep; input: WorkflowActionInput }) => {
      const options = { path: { publicId }, body: input };
      switch (step) {
        case 'publish':
          return api.post('/api/v1/complaints/{publicId}/publish', options);
        case 'completeActionPlan':
          return api.post('/api/v1/complaints/{publicId}/action-plan/complete', options);
        case 'close':
          return api.post('/api/v1/complaints/{publicId}/close', options);
      }
    },
    onSuccess: (result, { step }) => {
      changed(result.data);
      notify.success(result.message ?? done[step](result.data));
    },
  });
}

/** D4: the why-why analysis; the first save opens D5. */
export function useSaveRootCause(publicId: string) {
  const api = useCcApi();
  const changed = useComplaintChanged();
  return useMutation({
    mutationFn: async (input: RootCauseInput) => (await api.put('/api/v1/complaints/{publicId}/root-cause', { path: { publicId }, body: input })).data,
    onSuccess: changed,
  });
}

export type TextStep = 'verification' | 'horizontalDeployment' | 'closure';

/** D6, D7 or D8; saving the open step opens the next one, and saving D8 sends the complaint to the initiator. */
export function useSaveStep(publicId: string, step: TextStep) {
  const api = useCcApi();
  const changed = useComplaintChanged();
  return useMutation({
    mutationFn: async (input: StepInput) => {
      const options = { path: { publicId }, body: input };
      switch (step) {
        case 'verification':
          return (await api.put('/api/v1/complaints/{publicId}/verification', options)).data;
        case 'horizontalDeployment':
          return (await api.put('/api/v1/complaints/{publicId}/horizontal-deployment', options)).data;
        case 'closure':
          return (await api.put('/api/v1/complaints/{publicId}/closure', options)).data;
      }
    },
    onSuccess: changed,
  });
}

/** Adds or changes a containment action (D3); no email is sent. */
export function useSaveContainment(publicId: string) {
  const api = useCcApi();
  const stale = useComplaintStale(publicId);
  return useMutation({
    mutationFn: ({ lineId, input }: { lineId: number | null; input: ContainmentInput }) =>
      lineId === null
        ? api.post('/api/v1/complaints/{publicId}/containment-actions', { path: { publicId }, body: input })
        : api.put('/api/v1/complaints/{publicId}/containment-actions/{lineId}', { path: { publicId, lineId }, body: input }),
    onSuccess: stale,
  });
}

export function useDeleteContainment(publicId: string) {
  const api = useCcApi();
  const stale = useComplaintStale(publicId);
  return useMutation({
    mutationFn: (lineId: number) => api.delete('/api/v1/complaints/{publicId}/containment-actions/{lineId}', { path: { publicId, lineId } }),
    onSuccess: stale,
  });
}

/** Adds or changes a D5 action; its (new) owner is emailed. */
export function useSaveAction(publicId: string) {
  const api = useCcApi();
  const changed = useComplaintChanged();
  return useMutation({
    mutationFn: async ({ actionId, input }: { actionId: number | null; input: ActionInput }) =>
      (actionId === null
        ? await api.post('/api/v1/complaints/{publicId}/actions', { path: { publicId }, body: input })
        : await api.put('/api/v1/complaints/{publicId}/actions/{actionId}', { path: { publicId, actionId }, body: input })
      ).data,
    onSuccess: changed,
  });
}

export function useDeleteAction(publicId: string) {
  const api = useCcApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (actionId: number) => api.delete('/api/v1/complaints/{publicId}/actions/{actionId}', { path: { publicId, actionId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: complaintKeys.detail(publicId) });
      void queryClient.invalidateQueries({ queryKey: platformKeys.me() });
    },
  });
}

/** The owner adds evidence to their open action; the same file name again becomes a new version. */
export function useUploadEvidence(publicId: string) {
  const api = useCcApi();
  const stale = useComplaintStale(publicId);
  const notify = useNotify();
  return useMutation({
    mutationFn: ({ actionId, file }: { actionId: number; file: File }) => {
      const form = new FormData();
      form.append('file', file);
      return api.post('/api/v1/complaints/{publicId}/actions/{actionId}/evidence', { path: { publicId, actionId }, body: form });
    },
    onSuccess: async (result) => {
      await stale();
      notify.success(result.message ?? `${result.data.fileName} uploaded.`);
    },
    onError: (error) => {
      notify.error(error, 'The evidence could not be uploaded.');
    },
  });
}

/** The owner closes their action (it needs evidence); the initiator is emailed. */
export function useCloseAction(publicId: string) {
  const api = useCcApi();
  const changed = useComplaintChanged();
  return useMutation({
    mutationFn: async ({ actionId, input }: { actionId: number; input: CloseActionInput }) =>
      (await api.post('/api/v1/complaints/{publicId}/actions/{actionId}/close', { path: { publicId, actionId }, body: input })).data,
    onSuccess: changed,
  });
}

/** Adds a first-page document (an evidence image or file); the same file name again becomes a new version. */
export function useUploadDocument(publicId: string) {
  const api = useCcApi();
  const queryClient = useQueryClient();
  const notify = useNotify();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api.post('/api/v1/complaints/{publicId}/documents', { path: { publicId }, body: form });
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: complaintKeys.detail(publicId) });
      notify.success(result.message ?? `${result.data.fileName} uploaded.`);
    },
    onError: (error) => {
      notify.error(error, 'The document could not be uploaded.');
    },
  });
}
