import type { AdminActionInput } from '@cyient/api-client/cc';
import { ccEndpoints } from '@/api-callers/api-endpoints';
import type { CcApi } from '@/types/api';
import type { ComplaintListQuery } from '@/types/complaints';

/** Every complaint, drafts included. */
export const listAdminComplaints = (api: CcApi, query: ComplaintListQuery, signal?: AbortSignal) =>
  api.get(ccEndpoints.adminComplaint.collection, { query, signal });

export const getComplaintHistory = async (api: CcApi, publicId: string, signal?: AbortSignal) =>
  (await api.get(ccEndpoints.adminComplaint.history, { path: { publicId }, signal })).data;

export const listComplaintEmails = (api: CcApi, publicId: string, page: number, pageSize: number, signal?: AbortSignal) =>
  api.get(ccEndpoints.adminComplaint.emails, { path: { publicId }, query: { page, pageSize }, signal });

export const listComplaintAudit = (api: CcApi, publicId: string, page: number, pageSize: number, signal?: AbortSignal) =>
  api.get(ccEndpoints.adminComplaint.audit, { path: { publicId }, query: { page, pageSize }, signal });

/** Cancels a complaint that is not closed; open tasks close and the initiator is emailed. */
export const cancelComplaint = (api: CcApi, publicId: string, input: AdminActionInput) =>
  api.post(ccEndpoints.adminComplaint.cancel, { path: { publicId }, body: input });
