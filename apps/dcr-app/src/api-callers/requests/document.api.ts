import { dcrEndpoints } from '@/api-callers/api-endpoints';
import type { DcrApi } from '@/types/api';

export const listRequestDocuments = async (api: DcrApi, publicId: string, allVersions: boolean, signal?: AbortSignal) =>
  (await api.get(dcrEndpoints.document.collection, { path: { publicId }, query: { allVersions }, signal })).data;

/** Adds a document to the draft; the same file name again becomes a new version. */
export function uploadRequestDocument(api: DcrApi, publicId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  return api.post(dcrEndpoints.document.collection, { path: { publicId }, body: form });
}
