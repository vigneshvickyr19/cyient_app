import { withoutPaging } from '@cyient/api-client';
import type { IssueInput, WorkflowActionInput } from '@cyient/api-client/mppl';
import { mpplEndpoints } from '@/api-callers/api-endpoints';
import type { MpplApi } from '@/types/api';
import type { IssueListQuery } from '@/types/issues';

export type IssueStep = 'submit' | 'close';

/** Open Issues, Fixed Issues or the user's drafts, paged, filtered and sorted on the server. */
export const listIssues = (api: MpplApi, query: IssueListQuery, signal?: AbortSignal) => api.get(mpplEndpoints.issue.collection, { query, signal });

/** The open issues waiting for the signed-in Sourcing Lead, longest waiting first. */
export const listPendingIssues = (api: MpplApi, page: number, pageSize: number, signal?: AbortSignal) =>
  api.get(mpplEndpoints.issue.pending, { query: { page, pageSize }, signal });

/** One issue with its PO and sourcing details, escalations, the actions open to the user and its version. */
export const getIssue = async (api: MpplApi, publicId: string, signal?: AbortSignal) =>
  (await api.get(mpplEndpoints.issue.item, { path: { publicId }, signal })).data;

export const getIssueLog = async (api: MpplApi, publicId: string, signal?: AbortSignal) =>
  (await api.get(mpplEndpoints.issue.log, { path: { publicId }, signal })).data;

/**
 * Saves the New Issue form as a draft. The form keeps one Idempotency-Key, so saving again after a lost answer
 * returns the same draft instead of a second one.
 */
export const createDraft = async (api: MpplApi, input: IssueInput, idempotencyKey: string) =>
  (await api.post(mpplEndpoints.issue.collection, { body: input, headers: { 'Idempotency-Key': idempotencyKey } })).data;

export const updateDraft = async (api: MpplApi, publicId: string, input: IssueInput) =>
  (await api.put(mpplEndpoints.issue.item, { path: { publicId }, body: input })).data;

/** Submit (the buyer) or close (the Sourcing Lead), with the comment and the version the user saw. */
export const runIssueStep = (api: MpplApi, publicId: string, step: IssueStep, input: WorkflowActionInput) =>
  step === 'submit'
    ? api.post(mpplEndpoints.issue.submit, { path: { publicId }, body: input })
    : api.post(mpplEndpoints.issue.close, { path: { publicId }, body: input });

/** The filtered list as an Excel file, every row (no paging). */
export const exportIssues = (api: MpplApi, query: IssueListQuery) => api.download(mpplEndpoints.issue.export, { query: withoutPaging(query) });
