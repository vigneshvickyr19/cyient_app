import { mpplEndpoints } from '@/api-callers/api-endpoints';
import type { MpplApi } from '@/types/api';

export const listIssueDocuments = async (api: MpplApi, publicId: string, allVersions: boolean, signal?: AbortSignal) =>
  (await api.get(mpplEndpoints.document.collection, { path: { publicId }, query: { allVersions }, signal })).data;

/** Adds a reference document to the draft; the same file name again becomes a new version. */
export function uploadIssueDocument(api: MpplApi, publicId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  return api.post(mpplEndpoints.document.collection, { path: { publicId }, body: form });
}
