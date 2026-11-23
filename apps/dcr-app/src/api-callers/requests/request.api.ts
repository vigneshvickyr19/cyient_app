import { newIdempotencyKey, withoutPaging } from '@cyient/api-client';
import type { DraftDetails, ReleaseInput, WorkflowActionInput } from '@cyient/api-client/dcr';
import { dcrEndpoints } from '@/api-callers/api-endpoints';
import type { DcrApi } from '@/types/api';
import type { RequestListQuery } from '@/types/requests';

export type WorkflowStep = 'submit' | 'approve' | 'revert' | 'reject';

/** All Requests / My Requests, paged and filtered on the server. */
export const listRequests = (api: DcrApi, query: RequestListQuery, signal?: AbortSignal) =>
  api.get(dcrEndpoints.request.collection, { query, signal });

/** The signed-in user's Pending Actions. */
export const listPendingRequests = (api: DcrApi, page: number, pageSize: number, signal?: AbortSignal) =>
  api.get(dcrEndpoints.request.pending, { query: { page, pageSize }, signal });

/** One DCR with its clause lines, approvers, the actions open to the user and its version. */
export const getRequest = async (api: DcrApi, publicId: string, signal?: AbortSignal) =>
  (await api.get(dcrEndpoints.request.item, { path: { publicId }, signal })).data;

export const getRequestLog = async (api: DcrApi, publicId: string, signal?: AbortSignal) =>
  (await api.get(dcrEndpoints.request.log, { path: { publicId }, signal })).data;

/** Saves the New Request form as a draft; a retried click can't create two (Idempotency-Key). */
export const createDraft = async (api: DcrApi, draft: DraftDetails) =>
  (await api.post(dcrEndpoints.request.collection, { body: draft, headers: { 'Idempotency-Key': newIdempotencyKey() } })).data;

export const updateDraft = async (api: DcrApi, publicId: string, draft: DraftDetails) =>
  (await api.put(dcrEndpoints.request.item, { path: { publicId }, body: draft })).data;

/** Submit, approve, send back or reject, with the comment and the version the user saw. */
export function runWorkflowStep(api: DcrApi, publicId: string, step: WorkflowStep, input: WorkflowActionInput) {
  const options = { path: { publicId }, body: input };
  switch (step) {
    case 'submit':
      return api.post(dcrEndpoints.request.submit, options);
    case 'approve':
      return api.post(dcrEndpoints.request.approve, options);
    case 'revert':
      return api.post(dcrEndpoints.request.revert, options);
    case 'reject':
      return api.post(dcrEndpoints.request.reject, options);
  }
}

export const releaseRequest = (api: DcrApi, publicId: string, input: ReleaseInput) =>
  api.post(dcrEndpoints.request.release, { path: { publicId }, body: input });

export const downloadRequestPdf = (api: DcrApi, publicId: string) =>
  api.download(dcrEndpoints.request.pdf, { path: { publicId } });

/** The filtered list as an Excel file, every row (no paging). */
export const exportRequests = (api: DcrApi, query: RequestListQuery) =>
  api.download(dcrEndpoints.request.export, { query: withoutPaging(query) });
