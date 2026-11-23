import { newIdempotencyKey } from '@cyient/api-client';
import type { ComplaintInput, RootCauseInput, StepInput, WorkflowActionInput } from '@cyient/api-client/cc';
import { ccEndpoints } from '@/api-callers/api-endpoints';
import type { CcApi } from '@/types/api';
import type { ComplaintListQuery } from '@/types/complaints';

export type WorkflowStep = 'publish' | 'completeActionPlan' | 'close';
export type TextStep = 'verification' | 'horizontalDeployment' | 'closure';

/** External complaints, paged, filtered and sorted on the server. */
export const listComplaints = (api: CcApi, query: ComplaintListQuery, signal?: AbortSignal) =>
  api.get(ccEndpoints.complaint.collection, { query, signal });

/** The signed-in user's Pending Actions: their open D5 actions and complaints back with them to close. */
export const listPendingComplaints = (api: CcApi, page: number, pageSize: number, signal?: AbortSignal) =>
  api.get(ccEndpoints.complaint.pending, { query: { page, pageSize }, signal });

/** One complaint with its first page, team, D4 to D8, the actions open to the user and its version. */
export const getComplaint = async (api: CcApi, publicId: string, signal?: AbortSignal) =>
  (await api.get(ccEndpoints.complaint.item, { path: { publicId }, signal })).data;

/** The published complaints of a customer, to pick the one a repeat complaint repeats. */
export const listEarlierComplaints = async (api: CcApi, customerId: number, excluding: string | undefined, signal?: AbortSignal) =>
  (await api.get(ccEndpoints.complaint.earlier, { query: { customerId, excluding }, signal })).data;

export const getComplaintLog = async (api: CcApi, publicId: string, signal?: AbortSignal) =>
  (await api.get(ccEndpoints.complaint.log, { path: { publicId }, signal })).data;

/** Saves the first page as a draft; a retried click can't create two (Idempotency-Key). */
export const createComplaint = async (api: CcApi, input: ComplaintInput) =>
  (await api.post(ccEndpoints.complaint.collection, { body: input, headers: { 'Idempotency-Key': newIdempotencyKey() } })).data;

export const updateComplaint = async (api: CcApi, publicId: string, input: ComplaintInput) =>
  (await api.put(ccEndpoints.complaint.item, { path: { publicId }, body: input })).data;

/** Publish, complete the action plan (D5) or close, with the comment and the version the user saw. */
export function runWorkflowStep(api: CcApi, publicId: string, step: WorkflowStep, input: WorkflowActionInput) {
  const options = { path: { publicId }, body: input };
  switch (step) {
    case 'publish':
      return api.post(ccEndpoints.complaint.publish, options);
    case 'completeActionPlan':
      return api.post(ccEndpoints.complaint.actionPlanComplete, options);
    case 'close':
      return api.post(ccEndpoints.complaint.close, options);
  }
}

/** D4: the why-why analysis; the first save opens D5. */
export const saveRootCause = async (api: CcApi, publicId: string, input: RootCauseInput) =>
  (await api.put(ccEndpoints.complaint.rootCause, { path: { publicId }, body: input })).data;

/** D6, D7 or D8; saving the open step opens the next one, and saving D8 sends the complaint to the initiator. */
export async function saveStep(api: CcApi, publicId: string, step: TextStep, input: StepInput) {
  const options = { path: { publicId }, body: input };
  switch (step) {
    case 'verification':
      return (await api.put(ccEndpoints.complaint.verification, options)).data;
    case 'horizontalDeployment':
      return (await api.put(ccEndpoints.complaint.horizontalDeployment, options)).data;
    case 'closure':
      return (await api.put(ccEndpoints.complaint.closure, options)).data;
  }
}

export const downloadEightDReport = (api: CcApi, publicId: string) =>
  api.download(ccEndpoints.complaint.eightDReport, { path: { publicId } });
