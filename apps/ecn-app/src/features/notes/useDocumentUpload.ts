import type { AttachmentKind } from '@cyient/api-client/ecn';
import { documentUpload, useNotify, type DocumentListProps } from '@cyient/shared-ui';
import { useUploadAttachment } from './mutations';
import { attachmentExtensions } from './status';

/**
 * The upload part of a document list for one kind of attachment on a note: the file is sent at once, and the result
 * (or why it failed) is shown as a notification.
 */
export function useDocumentUpload(publicId: string) {
  const upload = useUploadAttachment();
  const notify = useNotify();
  return (kind: AttachmentKind, cftActionId?: number): NonNullable<DocumentListProps['upload']> => ({
    onUpload: async (file) => {
      try {
        const result = await upload.mutateAsync({ publicId, file, kind, cftActionId });
        notify.success(result.message ?? `${result.data.fileName} uploaded.`);
      } catch (error) {
        notify.error(error, 'The document could not be uploaded.');
      }
    },
    uploading: upload.isPending && upload.variables.kind === kind && upload.variables.cftActionId === cftActionId,
    extensions: kind === 'SapEcn' ? ['.pdf'] : attachmentExtensions,
    maxSizeMb: documentUpload.maxSizeMb,
  });
}
