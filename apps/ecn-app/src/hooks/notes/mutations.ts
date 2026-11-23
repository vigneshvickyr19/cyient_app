import type { ApiResult } from '@cyient/api-client';
import type {
  AttendanceInput,
  CftActionInput,
  CftTeamInput,
  DraftDetails,
  ImmediateActionInput,
  NoteDetails,
  NoteType,
  PartInput,
  PublishToCftInput,
  WorkflowActionInput,
} from '@cyient/api-client/ecn';
import { platformTags, toastMeta } from '@cyient/shared-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { STATUS_ACTIONS } from '@/constants/status-actions';
import { ecnTags } from '@/api-callers/api-tags';
import { uploadAttachment, type AttachmentUpload } from '@/api-callers/notes/attachment.api';
import { deleteImmediateAction, saveImmediateAction } from '@/api-callers/notes/immediate-action.api';
import {
  createDraft,
  publishToCft,
  runWorkflowStep,
  setAttendance,
  setCftTeam,
  updateCftAction,
  updateDraft,
  type WorkflowStep,
} from '@/api-callers/notes/note.api';
import { deletePart, savePart } from '@/api-callers/notes/part.api';
import { useEcnApi } from '@/hooks/useEcnApi';
import { typeLabels } from '@/constants/note-status';

/**
 * After a change: the note's details (with the new version) are stored; its log, documents, the lists, pending
 * actions and the Pending Actions badge are read again.
 */
function useNoteChanged() {
  const queryClient = useQueryClient();
  return (note: NoteDetails) => {
    queryClient.setQueryData(ecnTags.note.detail(note.publicId), note);
    void queryClient.invalidateQueries({ queryKey: ecnTags.note.log(note.publicId) });
    void queryClient.invalidateQueries({ queryKey: ecnTags.note.attachmentsAll(note.publicId) });
    void queryClient.invalidateQueries({ queryKey: ecnTags.note.lists() });
    void queryClient.invalidateQueries({ queryKey: ecnTags.note.pendingAll() });
    void queryClient.invalidateQueries({ queryKey: ecnTags.report.all });
    void queryClient.invalidateQueries({ queryKey: platformTags.me() });
  };
}

/** Saves the New ECN / New TCN front page as a draft. */
export function useCreateDraft() {
  const api = useEcnApi();
  const changed = useNoteChanged();
  return useMutation({
    meta: toastMeta<{ noteType: NoteType; noteNo: string | null }>({ success: (note) => `${typeLabels[note.noteType]} ${note.noteNo} saved as a draft. Name the CFT team next.` }),
    mutationFn: (draft: DraftDetails) => createDraft(api, draft),
    onSuccess: changed,
  });
}

export function useUpdateDraft(publicId: string) {
  const api = useEcnApi();
  const changed = useNoteChanged();
  return useMutation({
    meta: toastMeta({ success: 'Changes saved.' }),
    mutationFn: (draft: DraftDetails) => updateDraft(api, publicId, draft),
    onSuccess: changed,
  });
}

export function useSetCftTeam(publicId: string) {
  const api = useEcnApi();
  const changed = useNoteChanged();
  return useMutation({
    meta: toastMeta({ success: 'CFT team saved.', error: 'The CFT team could not be saved.' }),
    mutationFn: (input: CftTeamInput) => setCftTeam(api, publicId, input),
    onSuccess: changed,
  });
}

export function useSetAttendance(publicId: string) {
  const api = useEcnApi();
  const changed = useNoteChanged();
  return useMutation({
    meta: toastMeta({ success: 'Attendance saved.', error: 'The attendance could not be saved.' }),
    mutationFn: (input: AttendanceInput) => setAttendance(api, publicId, input),
    onSuccess: changed,
  });
}

/** A member updates one predefined action on their own function tab; the answer is the whole note. */
export function useUpdateCftAction(publicId: string) {
  const api = useEcnApi();
  const changed = useNoteChanged();
  return useMutation({
    meta: toastMeta<NoteDetails>({ success: (note) => (note.status === STATUS_ACTIONS.CFT_CLOSED ? 'Action saved. Every CFT action is closed; the initiator can publish the note to the Reviewer.' : 'Action saved.'), error: 'The action could not be saved.' }),
    mutationFn: ({ actionId, input }: { actionId: number; input: CftActionInput }) => updateCftAction(api, publicId, actionId, input),
    onSuccess: changed,
  });
}

/** The steps that take only a comment and the version the user saw. */
export function useWorkflowAction(publicId: string) {
  const api = useEcnApi();
  const changed = useNoteChanged();
  return useMutation({
    mutationFn: ({ step, input }: { step: WorkflowStep; input: WorkflowActionInput }) => runWorkflowStep(api, publicId, step, input),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}

/** Publishes to the CFT with the ECN Target Date: each named function's tab gets its actions and its member is emailed. */
export function usePublishToCft(publicId: string) {
  const api = useEcnApi();
  const changed = useNoteChanged();
  return useMutation({
    meta: toastMeta({ success: 'Published to the CFT. Each named member is emailed.' }),
    mutationFn: (input: PublishToCftInput) => publishToCft(api, publicId, input),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}

/** ECN Parts and Immediate Actions rows have their own version; the note is read again after each change. */
function useLineChanged(publicId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ecnTags.note.detail(publicId), exact: true });
}

export function useSavePart(publicId: string) {
  const api = useEcnApi();
  const changed = useLineChanged(publicId);
  return useMutation({
    meta: toastMeta<unknown, { partId: number | null }>({ success: (_, { partId }) => (partId === null ? 'Part added.' : 'Part changed.') }),
    mutationFn: ({ partId, input }: { partId: number | null; input: PartInput }) => savePart(api, publicId, partId, input),
    onSuccess: changed,
  });
}

export function useDeletePart(publicId: string) {
  const api = useEcnApi();
  const changed = useLineChanged(publicId);
  return useMutation({
    meta: toastMeta({ success: 'Part deleted.' }),
    mutationFn: (partId: number) => deletePart(api, publicId, partId),
    onSuccess: changed,
  });
}

export function useSaveImmediateAction(publicId: string) {
  const api = useEcnApi();
  const changed = useLineChanged(publicId);
  return useMutation({
    meta: toastMeta<unknown, { actionId: number | null }>({ success: (_, { actionId }) => (actionId === null ? 'Immediate action added.' : 'Immediate action changed.') }),
    mutationFn: ({ actionId, input }: { actionId: number | null; input: ImmediateActionInput }) =>
      saveImmediateAction(api, publicId, actionId, input),
    onSuccess: changed,
  });
}

export function useDeleteImmediateAction(publicId: string) {
  const api = useEcnApi();
  const changed = useLineChanged(publicId);
  return useMutation({
    meta: toastMeta({ success: 'Immediate action deleted.' }),
    mutationFn: (actionId: number) => deleteImmediateAction(api, publicId, actionId),
    onSuccess: changed,
  });
}

/** Adds a document to a note; the same file name again becomes a new version. The note and its documents are read again. */
export function useUploadAttachment() {
  const api = useEcnApi();
  const queryClient = useQueryClient();
  return useMutation({
    meta: toastMeta<ApiResult<{ fileName: string }>>({ success: (result) => `${result.data.fileName} uploaded.`, error: 'The file could not be uploaded. Add it again on the Attachments tab.' }),
    mutationFn: (upload: AttachmentUpload) => uploadAttachment(api, upload),
    onSuccess: (_, { publicId }) => queryClient.invalidateQueries({ queryKey: ecnTags.note.detail(publicId) }),
  });
}
