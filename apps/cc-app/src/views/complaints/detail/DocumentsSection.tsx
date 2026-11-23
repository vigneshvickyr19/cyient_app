import type { ComplaintDetails } from '@cyient/api-client/cc';
import {
  CheckboxField,
  DocumentList,
  documentUpload,
  errorMessage,
  ErrorState,
  SectionCard,
  SectionSkeleton,
  useDownloadDocument,
} from '@cyient/shared-ui';
import { useState } from 'react';
import { useUploadDocument } from '@/hooks/complaints/mutations';
import { useComplaintDocuments } from '@/hooks/complaints/queries';

export interface DocumentsSectionProps {
  complaint: ComplaintDetails;
  canUpload: boolean;
}

export function DocumentsSection({ complaint, canUpload }: DocumentsSectionProps) {
  const [allVersions, setAllVersions] = useState(false);
  const documents = useComplaintDocuments(complaint.publicId, allVersions);
  const upload = useUploadDocument(complaint.publicId);
  const download = useDownloadDocument();

  return (
    <SectionCard
      title="Documents"
      subheader="Evidence images and documents of the first page, and the evidence of the D5 actions"
      actions={<CheckboxField label="Earlier versions" checked={allVersions} onChange={setAllVersions} />}
    >
      {documents.isPending ? (
        <SectionSkeleton />
      ) : documents.isError ? (
        <ErrorState message={errorMessage(documents.error)} onRetry={() => void documents.refetch()} />
      ) : (
        <DocumentList
          files={documents.data}
          onDownload={(file) => { download.mutate(file.id); }}
          downloading={(file) => download.isPending && download.variables === file.id}
          upload={canUpload ? { onUpload: (file) => upload.mutateAsync(file), uploading: upload.isPending, ...documentUpload } : undefined}
        />
      )}
    </SectionCard>
  );
}
