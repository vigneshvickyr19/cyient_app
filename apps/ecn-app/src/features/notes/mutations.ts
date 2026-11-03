import { newIdempotencyKey } from '@cyient/api-client';
import type {
  AttachmentKind,
  AttendanceInput,
  CftActionInput,
  CftTeamInput,
  DraftDetails,
  ImmediateActionInput,
  NoteDetails,
  PartInput,
  PublishToCftInput,
  WorkflowActionInput,
} from '@cyient/api-client/ecn';
import { platformKeys, useNotify } from '@cyient/shared-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEcnApi } from '../../lib/api';
import { reportKeys } from '../reports/queries';
import { noteKeys } from './keys';

/**
 * After a change: the note's details (with the new version) are stored; its log, documents, the lists, pending
 * actions and the Pending Actions badge are read again.
 */
function useNoteChanged() {
  const queryClient = useQueryClient();
  return (note: NoteDetails) => {
    queryClient.setQueryData(noteKeys.detail(note.publicId), note);
    void queryClient.invalidateQueries({ queryKey: noteKeys.log(note.publicId) });
    void queryClient.invalidateQueries({ queryKey: [...noteKeys.detail(note.publicId), 'attachments'] });
    void queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: noteKeys.pendingAll() });
    void queryClient.invalidateQueries({ queryKey: reportKeys.all });
    void queryClient.invalidateQueries({ queryKey: platformKeys.me() });
  };
}

/** Saves the New ECN / New TCN front page as a draft; a retried click can't create two (Idempotency-Key). */
export function useCreateDraft() {
  const api = useEcnApi();
  const changed = useNoteChanged();
  return useMutation({
    mutationFn: async (draft: DraftDetails) =>
      (await api.post('/api/v1/notes', { body: draft, headers: { 'Idempotency-Key': newIdempotencyKey() } })).data,
    onSuccess: changed,
  });
}

export function useUpdateDraft(publicId: string) {
  const api = useEcnApi();
  const changed = useNoteChanged();
  return useMutation({
    mutationFn: async (draft: DraftDetails) => (await api.put('/api/v1/notes/{publicId}', { path: { publicId }, body: draft })).data,
    onSuccess: changed,
  });
}

export function useSetCftTeam(publicId: string) {
  const api = useEcnApi();
  const changed = useNoteChanged();
  return useMutation({
    mutationFn: async (input: CftTeamInput) => (await api.put('/api/v1/notes/{publicId}/cft-team', { path: { publicId }, body: input })).data,
    onSuccess: changed,
  });
}

export function useSetAttendance(publicId: string) {
  const api = useEcnApi();
  const changed = useNoteChanged();
  return useMutation({
    mutationFn: async (input: AttendanceInput) => (await api.put('/api/v1/notes/{publicId}/attendance', { path: { publicId }, body: input })).data,
    onSuccess: changed,
  });
}

/** A member updates one predefined action on their own function tab; the answer is the whole note. */
export function useUpdateCftAction(publicId: string) {
  const api = useEcnApi();
  const changed = useNoteChanged();
  return useMutation({
    mutationFn: async ({ actionId, input }: { actionId: number; input: CftActionInput }) =>
      (await api.put('/api/v1/notes/{publicId}/cft-actions/{actionId}', { path: { publicId, actionId }, body: input })).data,
    onSuccess: changed,
  });
}

export type WorkflowStep = 'sendMeetingNotification' | 'publishToReviewer' | 'review' | 'approve' | 'release';

/** The steps that take only a comment and the version the user saw. */
export function useWorkflowAction(publicId: string) {
  const api = useEcnApi();
  const notify = useNotify();
  const changed = useNoteChanged();
  return useMutation({
    mutationFn: async ({ step, input }: { step: WorkflowStep; input: WorkflowActionInput }) => {
      const options = { path: { publicId }, body: input };
      switch (step) {
        case 'sendMeetingNotification':
          return api.post('/api/v1/notes/{publicId}/send-meeting-notification', options);
        case 'publishToReviewer':
          return api.post('/api/v1/notes/{publicId}/publish-to-reviewer', options);
        case 'review':
          return api.post('/api/v1/notes/{publicId}/review', options);
        case 'approve':
          return api.post('/api/v1/notes/{publicId}/approve', options);
        case 'release':
          return api.post('/api/v1/notes/{publicId}/release', options);
      }
    },
    onSuccess: (result) => {
      changed(result.data);
      notify.success(result.message ?? 'Done.');
    },
  });
}

/** Publishes to the CFT with the ECN Target Date: each named function's tab gets its actions and its member is emailed. */
export function usePublishToCft(publicId: string) {
  const api = useEcnApi();
  const notify = useNotify();
  const changed = useNoteChanged();
  return useMutation({
    mutationFn: (input: PublishToCftInput) => api.post('/api/v1/notes/{publicId}/publish-to-cft', { path: { publicId }, body: input }),
    onSuccess: (result) => {
      changed(result.data);
      notify.success(result.message ?? 'Published to the CFT. Each named member is emailed.');
    },
  });
}

/** ECN Parts and Immediate Actions rows have their own version; the note is read again after each change. */
function useLineChanged(publicId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: noteKeys.detail(publicId), exact: true });
}

export function useSavePart(publicId: string) {
  const api = useEcnApi();
  const changed = useLineChanged(publicId);
  return useMutation({
    mutationFn: ({ partId, input }: { partId: number | null; input: PartInput }) =>
      partId === null
        ? api.post('/api/v1/notes/{publicId}/parts', { path: { publicId }, body: input })
        : api.put('/api/v1/notes/{publicId}/parts/{partId}', { path: { publicId, partId }, body: input }),
    onSuccess: changed,
  });
}

export function useDeletePart(publicId: string) {
  const api = useEcnApi();
  const changed = useLineChanged(publicId);
  return useMutation({
    mutationFn: (partId: number) => api.delete('/api/v1/notes/{publicId}/parts/{partId}', { path: { publicId, partId } }),
    onSuccess: changed,
  });
}

export function useSaveImmediateAction(publicId: string) {
  const api = useEcnApi();
  const changed = useLineChanged(publicId);
  return useMutation({
    mutationFn: ({ actionId, input }: { actionId: number | null; input: ImmediateActionInput }) =>
      actionId === null
        ? api.post('/api/v1/notes/{publicId}/immediate-actions', { path: { publicId }, body: input })
        : api.put('/api/v1/notes/{publicId}/immediate-actions/{actionId}', { path: { publicId, actionId }, body: input }),
    onSuccess: changed,
  });
}

export function useDeleteImmediateAction(publicId: string) {
  const api = useEcnApi();
  const changed = useLineChanged(publicId);
  return useMutation({
    mutationFn: (actionId: number) => api.delete('/api/v1/notes/{publicId}/immediate-actions/{actionId}', { path: { publicId, actionId } }),
    onSuccess: changed,
  });
}

export interface AttachmentUpload {
  publicId: string;
  file: File;
  kind: AttachmentKind;
  /** For an NPI Engineer tab action (kind CftAction). */
  cftActionId?: number;
}

/** Adds a document to a note; the same file name again becomes a new version. The note and its documents are read again. */
export function useUploadAttachment() {
  const api = useEcnApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, file, kind, cftActionId }: AttachmentUpload) => {
      const form = new FormData();
      form.append('file', file);
      form.append('kind', kind);
      if (cftActionId !== undefined) form.append('cftActionId', String(cftActionId));
      return api.post('/api/v1/notes/{publicId}/attachments', { path: { publicId }, body: form });
    },
    onSuccess: (_, { publicId }) => queryClient.invalidateQueries({ queryKey: noteKeys.detail(publicId) }),
  });
}
