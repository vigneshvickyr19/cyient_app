import { newIdempotencyKey } from '@cyient/api-client';
import type { InternalInput, WorkflowActionInput } from '@cyient/api-client/cc';
import { ccEndpoints } from '@/api-callers/api-endpoints';
import type { CcApi } from '@/types/api';
import type { InternalListQuery } from '@/types/complaints';

/** Internal complaints, paged and filtered on the server. */
export const listInternalComplaints = (api: CcApi, query: InternalListQuery, signal?: AbortSignal) =>
  api.get(ccEndpoints.internalComplaint.collection, { query, signal });

/** One internal complaint with its action lines and its version. */
export const getInternalComplaint = async (api: CcApi, publicId: string, signal?: AbortSignal) =>
  (await api.get(ccEndpoints.internalComplaint.item, { path: { publicId }, signal })).data;

/** Records an internal complaint; it is numbered at once. A retried click can't record two (Idempotency-Key). */
export const createInternalComplaint = async (api: CcApi, input: InternalInput) =>
  (await api.post(ccEndpoints.internalComplaint.collection, { body: input, headers: { 'Idempotency-Key': newIdempotencyKey() } })).data;

export const updateInternalComplaint = async (api: CcApi, publicId: string, input: InternalInput) =>
  (await api.put(ccEndpoints.internalComplaint.item, { path: { publicId }, body: input })).data;

export const closeInternalComplaint = (api: CcApi, publicId: string, input: WorkflowActionInput) =>
  api.post(ccEndpoints.internalComplaint.close, { path: { publicId }, body: input });
