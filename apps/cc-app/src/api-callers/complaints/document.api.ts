import { ccEndpoints } from '@/api-callers/api-endpoints';
import type { CcApi } from '@/types/api';

export const listComplaintDocuments = async (api: CcApi, publicId: string, allVersions: boolean, signal?: AbortSignal) =>
  (await api.get(ccEndpoints.document.collection, { path: { publicId }, query: { allVersions }, signal })).data;

/** Adds a first-page document (an evidence image or file); the same file name again becomes a new version. */
export function uploadComplaintDocument(api: CcApi, publicId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  return api.post(ccEndpoints.document.collection, { path: { publicId }, body: form });
}
