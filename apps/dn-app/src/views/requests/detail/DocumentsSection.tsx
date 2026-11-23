import type { RequestDetails } from '@cyient/api-client/dn';
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
import { useUploadDocument } from '@/hooks/requests/mutations';
import { useRequestDocuments } from '@/hooks/requests/queries';

export interface DocumentsSectionProps {
  request: RequestDetails;
}

export function DocumentsSection({ request }: DocumentsSectionProps) {
  const [allVersions, setAllVersions] = useState(false);
  const documents = useRequestDocuments(request.publicId, allVersions);
  const upload = useUploadDocument(request.publicId);
  const download = useDownloadDocument();
  const canUpload = request.allowedActions?.canUpload === true;

  return (
    <SectionCard
      title="Documents"
      subheader="Reference documents and reviewers' attachments."
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
