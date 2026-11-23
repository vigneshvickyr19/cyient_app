import { newIdempotencyKey, withoutPaging } from '@cyient/api-client';
import type {
  AttendanceInput,
  CftActionInput,
  CftTeamInput,
  DraftDetails,
  PublishToCftInput,
  WorkflowActionInput,
} from '@cyient/api-client/ecn';
import { ecnEndpoints } from '@/api-callers/api-endpoints';
import type { EcnApi } from '@/types/api';
import type { NoteListQuery } from '@/types/notes';

export type WorkflowStep = 'sendMeetingNotification' | 'publishToReviewer' | 'review' | 'approve' | 'release';

/** In progress, Closed and Search (All), ECNs, TCNs or both: paged, filtered and sorted on the server. */
export const listNotes = (api: EcnApi, query: NoteListQuery, signal?: AbortSignal) => api.get(ecnEndpoints.note.collection, { query, signal });

/** What waits for the signed-in user: CFT actions, a note to publish to the Reviewer, a review, an approval or a release. */
export const listPendingNotes = (api: EcnApi, page: number, pageSize: number, signal?: AbortSignal) =>
  api.get(ecnEndpoints.note.pending, { query: { page, pageSize }, signal });

/** One ECN or TCN with every tab, the actions open to the user and its version. */
export const getNote = async (api: EcnApi, publicId: string, signal?: AbortSignal) =>
  (await api.get(ecnEndpoints.note.item, { path: { publicId }, signal })).data;

export const getNoteLog = async (api: EcnApi, publicId: string, signal?: AbortSignal) =>
  (await api.get(ecnEndpoints.note.log, { path: { publicId }, signal })).data;

/** Saves the New ECN / New TCN front page as a draft; a retried click can't create two (Idempotency-Key). */
export const createDraft = async (api: EcnApi, draft: DraftDetails) =>
  (await api.post(ecnEndpoints.note.collection, { body: draft, headers: { 'Idempotency-Key': newIdempotencyKey() } })).data;

export const updateDraft = async (api: EcnApi, publicId: string, draft: DraftDetails) =>
  (await api.put(ecnEndpoints.note.item, { path: { publicId }, body: draft })).data;

export const setCftTeam = async (api: EcnApi, publicId: string, input: CftTeamInput) =>
  (await api.put(ecnEndpoints.note.cftTeam, { path: { publicId }, body: input })).data;

export const setAttendance = async (api: EcnApi, publicId: string, input: AttendanceInput) =>
  (await api.put(ecnEndpoints.note.attendance, { path: { publicId }, body: input })).data;

/** A member updates one predefined action on their own function tab; the answer is the whole note. */
export const updateCftAction = async (api: EcnApi, publicId: string, actionId: number, input: CftActionInput) =>
  (await api.put(ecnEndpoints.note.cftActionItem, { path: { publicId, actionId }, body: input })).data;

/** The steps that take only a comment and the version the user saw. */
export function runWorkflowStep(api: EcnApi, publicId: string, step: WorkflowStep, input: WorkflowActionInput) {
  const options = { path: { publicId }, body: input };
  switch (step) {
    case 'sendMeetingNotification':
      return api.post(ecnEndpoints.note.sendMeetingNotification, options);
    case 'publishToReviewer':
      return api.post(ecnEndpoints.note.publishToReviewer, options);
    case 'review':
      return api.post(ecnEndpoints.note.review, options);
    case 'approve':
      return api.post(ecnEndpoints.note.approve, options);
    case 'release':
      return api.post(ecnEndpoints.note.release, options);
  }
}

/** Publishes to the CFT with the ECN Target Date: each named function's tab gets its actions and its member is emailed. */
export const publishToCft = (api: EcnApi, publicId: string, input: PublishToCftInput) =>
  api.post(ecnEndpoints.note.publishToCft, { path: { publicId }, body: input });

export const downloadNotePdf = (api: EcnApi, publicId: string) => api.download(ecnEndpoints.note.pdf, { path: { publicId } });

/** The filtered list as an Excel file, every row (no paging). */
export const exportNotes = (api: EcnApi, query: NoteListQuery) => api.download(ecnEndpoints.note.export, { query: withoutPaging(query) });
