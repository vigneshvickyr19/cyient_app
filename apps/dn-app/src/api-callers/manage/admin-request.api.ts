import type { AddReviewerInput, AdminActionInput, ChangeReviewerInput, InformedPeopleInput } from '@cyient/api-client/dn';
import { dnEndpoints } from '@/api-callers/api-endpoints';
import type { DnApi } from '@/types/api';
import type { RequestListQuery } from '@/types/requests';

/** Every deviation, drafts included. */
export const listAdminRequests = (api: DnApi, query: RequestListQuery, signal?: AbortSignal) =>
  api.get(dnEndpoints.adminRequest.collection, { query, signal });

export const getAdminRequestHistory = async (api: DnApi, publicId: string, signal?: AbortSignal) =>
  (await api.get(dnEndpoints.adminRequest.history, { path: { publicId }, signal })).data;

export const listRequestEmails = (api: DnApi, publicId: string, page: number, pageSize: number, signal?: AbortSignal) =>
  api.get(dnEndpoints.adminRequest.emails, { path: { publicId }, query: { page, pageSize }, signal });

export const listRequestAudit = (api: DnApi, publicId: string, page: number, pageSize: number, signal?: AbortSignal) =>
  api.get(dnEndpoints.adminRequest.audit, { path: { publicId }, query: { page, pageSize }, signal });

export const closeRequest = (api: DnApi, publicId: string, input: AdminActionInput) =>
  api.post(dnEndpoints.adminRequest.close, { path: { publicId }, body: input });

export const addReviewer = (api: DnApi, publicId: string, input: AddReviewerInput) =>
  api.post(dnEndpoints.adminRequest.reviewers, { path: { publicId }, body: input });

export const changeReviewer = (api: DnApi, publicId: string, reviewerId: number, input: ChangeReviewerInput) =>
  api.put(dnEndpoints.adminRequest.reviewer, { path: { publicId, reviewerId }, body: input });

export const removeReviewer = (api: DnApi, publicId: string, reviewerId: number, input: AdminActionInput) =>
  api.post(dnEndpoints.adminRequest.reviewerRemove, { path: { publicId, reviewerId }, body: input });

export const setInformedPeople = (api: DnApi, publicId: string, input: InformedPeopleInput) =>
  api.put(dnEndpoints.adminRequest.informed, { path: { publicId }, body: input });
