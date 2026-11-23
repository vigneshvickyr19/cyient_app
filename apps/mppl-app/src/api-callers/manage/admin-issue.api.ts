import type { AdminActionInput } from '@cyient/api-client/mppl';
import { mpplEndpoints } from '@/api-callers/api-endpoints';
import type { MpplApi } from '@/types/api';
import type { IssueListQuery } from '@/types/issues';

/** Every issue, drafts included. */
export const listAdminIssues = (api: MpplApi, query: IssueListQuery, signal?: AbortSignal) =>
  api.get(mpplEndpoints.adminIssue.collection, { query, signal });

export const getIssueHistory = async (api: MpplApi, publicId: string, signal?: AbortSignal) =>
  (await api.get(mpplEndpoints.adminIssue.history, { path: { publicId }, signal })).data;

export const listIssueEmails = (api: MpplApi, publicId: string, page: number, pageSize: number, signal?: AbortSignal) =>
  api.get(mpplEndpoints.adminIssue.emails, { path: { publicId }, query: { page, pageSize }, signal });

export const listIssueAudit = (api: MpplApi, publicId: string, page: number, pageSize: number, signal?: AbortSignal) =>
  api.get(mpplEndpoints.adminIssue.audit, { path: { publicId }, query: { page, pageSize }, signal });

/** Closes an open issue for Sourcing, with a reason. */
export const closeIssueAsAdmin = (api: MpplApi, publicId: string, input: AdminActionInput) =>
  api.post(mpplEndpoints.adminIssue.close, { path: { publicId }, body: input });
