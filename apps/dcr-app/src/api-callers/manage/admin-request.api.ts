import type { AdminActionInput, CorrectionInput } from '@cyient/api-client/dcr';
import { dcrEndpoints } from '@/api-callers/api-endpoints';
import type { DcrApi } from '@/types/api';
import type { RequestListQuery } from '@/types/requests';

/** Every request, drafts included. */
export const listAdminRequests = (api: DcrApi, query: RequestListQuery, signal?: AbortSignal) =>
  api.get(dcrEndpoints.adminRequest.collection, { query, signal });

export const getRequestHistory = async (api: DcrApi, publicId: string, signal?: AbortSignal) =>
  (await api.get(dcrEndpoints.adminRequest.history, { path: { publicId }, signal })).data;

export const listRequestEmails = (api: DcrApi, publicId: string, page: number, pageSize: number, signal?: AbortSignal) =>
  api.get(dcrEndpoints.adminRequest.emails, { path: { publicId }, query: { page, pageSize }, signal });

export const listRequestAudit = (api: DcrApi, publicId: string, page: number, pageSize: number, signal?: AbortSignal) =>
  api.get(dcrEndpoints.adminRequest.audit, { path: { publicId }, query: { page, pageSize }, signal });

export const cancelRequest = (api: DcrApi, publicId: string, input: AdminActionInput) =>
  api.post(dcrEndpoints.adminRequest.cancel, { path: { publicId }, body: input });

export const correctRequest = (api: DcrApi, publicId: string, input: CorrectionInput) =>
  api.post(dcrEndpoints.adminRequest.correct, { path: { publicId }, body: input });
