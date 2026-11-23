import type { ActionInput, CloseActionInput } from '@cyient/api-client/cc';
import { ccEndpoints } from '@/api-callers/api-endpoints';
import type { CcApi } from '@/types/api';

/** Adds (actionId null) or changes a D5 action; its (new) owner is emailed. */
export const saveAction = async (api: CcApi, publicId: string, actionId: number | null, input: ActionInput) =>
  (actionId === null
    ? await api.post(ccEndpoints.action.collection, { path: { publicId }, body: input })
    : await api.put(ccEndpoints.action.item, { path: { publicId, actionId }, body: input })
  ).data;

export const deleteAction = (api: CcApi, publicId: string, actionId: number) =>
  api.delete(ccEndpoints.action.item, { path: { publicId, actionId } });

/** The owner adds evidence to their open action; the same file name again becomes a new version. */
export function uploadEvidence(api: CcApi, publicId: string, actionId: number, file: File) {
  const form = new FormData();
  form.append('file', file);
  return api.post(ccEndpoints.action.evidence, { path: { publicId, actionId }, body: form });
}

/** The owner closes their action (it needs evidence); the initiator is emailed. */
export const closeAction = async (api: CcApi, publicId: string, actionId: number, input: CloseActionInput) =>
  (await api.post(ccEndpoints.action.close, { path: { publicId, actionId }, body: input })).data;
