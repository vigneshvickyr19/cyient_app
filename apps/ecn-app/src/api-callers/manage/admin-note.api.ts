import type { AdminActionInput } from '@cyient/api-client/ecn';
import { ecnEndpoints } from '@/api-callers/api-endpoints';
import type { EcnApi } from '@/types/api';

export const getNoteHistory = async (api: EcnApi, publicId: string, signal?: AbortSignal) =>
  (await api.get(ecnEndpoints.adminNote.history, { path: { publicId }, signal })).data;

export const listNoteEmails = (api: EcnApi, publicId: string, page: number, pageSize: number, signal?: AbortSignal) =>
  api.get(ecnEndpoints.adminNote.emails, { path: { publicId }, query: { page, pageSize }, signal });

export const listNoteAudit = (api: EcnApi, publicId: string, page: number, pageSize: number, signal?: AbortSignal) =>
  api.get(ecnEndpoints.adminNote.audit, { path: { publicId }, query: { page, pageSize }, signal });

/** Cancels a note not yet released; open tasks close and the initiator is emailed. */
export const cancelNote = (api: EcnApi, publicId: string, input: AdminActionInput) =>
  api.post(ecnEndpoints.adminNote.cancel, { path: { publicId }, body: input });
