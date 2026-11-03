import type { ApiErrorItem } from './errors';

/** Paging of a list response. */
export interface PageMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/** The one response shape every endpoint of every API uses. */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  errors: ApiErrorItem[];
  meta: PageMeta | null;
  traceId: string;
  timestamp: string;
  durationMs?: number | null;
}

/** A successful call: the data, the paging of a list, and the API's confirmation message. */
export interface ApiResult<T> {
  data: T;
  meta: PageMeta | null;
  message: string | null;
  traceId: string | null;
}

/** A downloaded file (PDF, Excel export, document) with the name the API gave it. */
export interface FileResult {
  blob: Blob;
  fileName: string | null;
  contentType: string;
}
