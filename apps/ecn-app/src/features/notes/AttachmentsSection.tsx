import type { AttachmentKind, NoteDetails } from '@cyient/api-client/ecn';
import { CheckboxField, DocumentList, ErrorState, errorMessage, SectionCard, SectionSkeleton, useFileDownload } from '@cyient/shared-ui';
import { Stack } from '@mui/material';
import { useState } from 'react';
import { useEcnApi } from '../../lib/api';
import { toDocumentItems } from './attachments';
import { useNoteAttachments } from './queries';
import { attachmentKindLabels } from './status';
import { useDocumentUpload } from './useDocumentUpload';

/** What each kind of document is for, under its heading. */
const kindHelp: Record<AttachmentKind, string> = {
  CustomerDocument: "The customer's ECN or TCN documents.",
  EcrApproval: 'Required before the meeting notification, as the customer approved the ECR.',
  SapEcn: 'The one PDF from SAP; another upload becomes its next version.',
  CftAction: 'Added on the NPI Engineer tab during CFT Review.',
};

/**
 * The Attachments tab: the customer's documents, the ECR approval and the SAP ECN PDF (added by the initiator while the
 * note is a draft), and the NPI Engineer tab's attachments. Everyone who can open the note can download them.
 */
export function AttachmentsSection({ note }: { note: NoteDetails }) {
  const api = useEcnApi();
  const [allVersions, setAllVersions] = useState(false);
  const attachments = useNoteAttachments(note.publicId, allVersions);
  const uploadFor = useDocumentUpload(note.publicId);
  const download = useFileDownload((fileId: number) => api.download('/api/v1/attachments/{fileId}', { path: { fileId } }));
  const canEdit = note.allowedActions?.canEdit === true;

  if (attachments.isPending) return <SectionSkeleton />;
  if (attachments.isError) return <ErrorState message={errorMessage(attachments.error)} onRetry={() => void attachments.refetch()} />;

  const ofKind = (kind: AttachmentKind) => attachments.data.filter((a) => a.kind === kind);
  const kinds = (['SapEcn', 'EcrApproval', 'CustomerDocument', 'CftAction'] as const).filter((kind) => {
    switch (kind) {
      case 'SapEcn':
        return note.ecnKind === 'Sap' || ofKind(kind).length > 0;
      case 'EcrApproval':
        return note.ecrApprovalFromCustomer || ofKind(kind).length > 0;
      case 'CustomerDocument':
        return true;
      case 'CftAction':
        return ofKind(kind).length > 0;
    }
  });

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <CheckboxField label="Earlier versions" checked={allVersions} onChange={setAllVersions} />
      </Stack>
      {kinds.map((kind) => (
        <SectionCard key={kind} title={attachmentKindLabels[kind]} subheader={kindHelp[kind]}>
          <DocumentList
            files={toDocumentItems(ofKind(kind))}
            onDownload={(file) => { download.mutate(file.id); }}
            downloading={(file) => download.isPending && download.variables === file.id}
            upload={canEdit && kind !== 'CftAction' ? uploadFor(kind) : undefined}
          />
        </SectionCard>
      ))}
    </Stack>
  );
}
