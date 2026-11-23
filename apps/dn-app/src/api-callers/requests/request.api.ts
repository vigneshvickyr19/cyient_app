import { newIdempotencyKey, withoutPaging } from '@cyient/api-client';
import type { ApproveInput, DraftDetails, SerialsInput, WorkflowActionInput } from '@cyient/api-client/dn';
import { dnEndpoints } from '@/api-callers/api-endpoints';
import type { DnApi } from '@/types/api';
import type { RequestListQuery } from '@/types/requests';

export type ReviewStep = 'update' | 'reject' | 'more-details';

/** Submit or resubmit, the reviewer actions, and the HOD's approve with its "further approval required" answer. */
export type WorkflowCall =
  | { step: 'submit' | ReviewStep; input: WorkflowActionInput }
  | { step: 'approve'; input: ApproveInput };

export type WorkflowStep = WorkflowCall['step'];

/** All Requests / My Requests, paged and filtered on the server, with Pending With and Pending Role. */
export const listRequests = (api: DnApi, query: RequestListQuery, signal?: AbortSignal) =>
  api.get(dnEndpoints.request.collection, { query, signal });

/** The signed-in user's Pending Requests, also the initiator's after Require more details. */
export const listPendingRequests = (api: DnApi, page: number, pageSize: number, signal?: AbortSignal) =>
  api.get(dnEndpoints.request.pending, { query: { page, pageSize }, signal });

/** One deviation with its reviewer sequence, the actions open to the user and its version. */
export const getRequest = async (api: DnApi, publicId: string, signal?: AbortSignal) =>
  (await api.get(dnEndpoints.request.item, { path: { publicId }, signal })).data;

/** The History tab: every workflow action with who, when, the step and the comment. */
export const getRequestHistory = async (api: DnApi, publicId: string, signal?: AbortSignal) =>
  (await api.get(dnEndpoints.request.history, { path: { publicId }, signal })).data;

/** Saves the form as a new draft; a retried click can't create two (Idempotency-Key). */
export const createDraft = async (api: DnApi, draft: DraftDetails) =>
  (await api.post(dnEndpoints.request.collection, { body: draft, headers: { 'Idempotency-Key': newIdempotencyKey() } })).data;

export const updateDraft = async (api: DnApi, publicId: string, draft: DraftDetails) =>
  (await api.put(dnEndpoints.request.item, { path: { publicId }, body: draft })).data;

/** Every action sends the comment and the version the user saw; a stale version gets 409. */
export function runWorkflowStep(api: DnApi, publicId: string, call: WorkflowCall) {
  const path = { publicId };
  switch (call.step) {
    case 'submit':
      return api.post(dnEndpoints.request.submit, { path, body: call.input });
    case 'update':
      return api.post(dnEndpoints.request.update, { path, body: call.input });
    case 'approve':
      return api.post(dnEndpoints.request.approve, { path, body: call.input });
    case 'reject':
      return api.post(dnEndpoints.request.reject, { path, body: call.input });
    case 'more-details':
      return api.post(dnEndpoints.request.moreDetails, { path, body: call.input });
  }
}

/** The production supervisor's serial range of an approved deviation. */
export const updateSerials = (api: DnApi, publicId: string, input: SerialsInput) =>
  api.post(dnEndpoints.request.serials, { path: { publicId }, body: input });

export const downloadRequestPdf = (api: DnApi, publicId: string) =>
  api.download(dnEndpoints.request.pdf, { path: { publicId } });

/** The filtered list as an Excel file, every row (no paging). */
export const exportRequests = (api: DnApi, query: RequestListQuery) =>
  api.download(dnEndpoints.request.export, { query: withoutPaging(query) });
