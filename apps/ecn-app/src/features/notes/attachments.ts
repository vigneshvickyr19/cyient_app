import type { AttachmentDetails } from '@cyient/api-client/ecn';
import type { DocumentItem } from '@cyient/shared-ui';

/** The note's attachments as the shared document list shows them; the highest version of each document is its current one. */
export function toDocumentItems(attachments: readonly AttachmentDetails[]): DocumentItem[] {
  const latest = new Map<string, number>();
  for (const a of attachments) latest.set(a.fileKey, Math.max(latest.get(a.fileKey) ?? 0, a.versionNo));
  return attachments.map((a) => ({
    id: a.fileId,
    fileKey: a.fileKey,
    fileName: a.fileName,
    sizeBytes: a.sizeBytes,
    versionNo: a.versionNo,
    isCurrent: a.versionNo === latest.get(a.fileKey),
    uploadedBy: a.uploadedBy,
    uploadedAt: a.uploadedAt,
  }));
}
