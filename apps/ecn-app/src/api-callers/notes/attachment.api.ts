import type { AttachmentKind } from '@cyient/api-client/ecn';
import { ecnEndpoints } from '@/api-callers/api-endpoints';
import type { EcnApi } from '@/types/api';

export interface AttachmentUpload {
  publicId: string;
  file: File;
  kind: AttachmentKind;
  /** For an NPI Engineer tab action (kind CftAction). */
  cftActionId?: number;
}

/** The note's documents: the current version of each, or every version. */
export const listNoteAttachments = async (api: EcnApi, publicId: string, allVersions: boolean, signal?: AbortSignal) =>
  (await api.get(ecnEndpoints.attachment.collection, { path: { publicId }, query: { allVersions }, signal })).data;

/** Adds a document to a note; the same file name again becomes a new version. */
export function uploadAttachment(api: EcnApi, { publicId, file, kind, cftActionId }: AttachmentUpload) {
  const form = new FormData();
  form.append('file', file);
  form.append('kind', kind);
  if (cftActionId !== undefined) form.append('cftActionId', String(cftActionId));
  return api.post(ecnEndpoints.attachment.collection, { path: { publicId }, body: form });
}

export const downloadAttachment = (api: EcnApi, fileId: number) => api.download(ecnEndpoints.attachment.file, { path: { fileId } });
