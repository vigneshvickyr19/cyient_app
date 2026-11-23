import type { AttachmentKind } from '@cyient/api-client/ecn';
import { documentUpload, type DocumentListProps } from '@cyient/shared-ui';
import { useUploadAttachment } from '@/hooks/notes/mutations';
import { attachmentExtensions } from '@/constants/note-status';

/**
 * The upload part of a document list for one kind of attachment on a note: the file is sent at once, and the app's
 * mutation toasts say whether it arrived.
 */
export function useDocumentUpload(publicId: string) {
  const upload = useUploadAttachment();
  return (kind: AttachmentKind, cftActionId?: number): NonNullable<DocumentListProps['upload']> => ({
    onUpload: async (file) => {
      try {
        await upload.mutateAsync({ publicId, file, kind, cftActionId });
      } catch {
        // The toast says why; the file stays chosen to try again
      }
    },
    uploading: upload.isPending && upload.variables.kind === kind && upload.variables.cftActionId === cftActionId,
    extensions: kind === 'SapEcn' ? ['.pdf'] : attachmentExtensions,
    maxSizeMb: documentUpload.maxSizeMb,
  });
}
