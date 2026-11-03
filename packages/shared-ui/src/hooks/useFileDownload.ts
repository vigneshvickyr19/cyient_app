import type { FileResult } from '@cyient/api-client';
import { saveFile } from '@cyient/shared-utils';
import { useMutation } from '@tanstack/react-query';
import { useHttpClient } from '../api/HttpClientContext';
import { useNotify } from '../notifications/NotificationProvider';

/**
 * Downloads a file (PDF, Excel export, document) and hands it to the browser to save; failures are shown as a
 * notification. `variables` lets the page tell which download is running.
 */
export function useFileDownload<V = void>(download: (variables: V) => Promise<FileResult>, fallbackName = 'download') {
  const notify = useNotify();
  return useMutation({
    mutationFn: download,
    onSuccess: (file) => {
      saveFile(file.blob, file.fileName, fallbackName);
    },
    onError: (error) => {
      notify.error(error, 'The file could not be downloaded.');
    },
  });
}

/** Downloads a stored document by its file id, from GET /api/v1/documents/{fileId} of the app's API. */
export function useDownloadDocument() {
  const http = useHttpClient();
  return useFileDownload((fileId: number) => http.download('/api/v1/documents/{fileId}', { path: { fileId } }));
}
