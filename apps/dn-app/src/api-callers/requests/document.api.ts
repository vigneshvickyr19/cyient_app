import { dnEndpoints } from '@/api-callers/api-endpoints';
import type { DnApi } from '@/types/api';

export const listRequestDocuments = async (api: DnApi, publicId: string, allVersions: boolean, signal?: AbortSignal) =>
  (await api.get(dnEndpoints.document.collection, { path: { publicId }, query: { allVersions }, signal })).data;

/** Adds a document; the same file name again becomes a new version. */
export function uploadRequestDocument(api: DnApi, publicId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  return api.post(dnEndpoints.document.collection, { path: { publicId }, body: form });
}
