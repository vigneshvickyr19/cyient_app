import type { IssueDetails } from '@cyient/api-client/mppl';
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
import { useUploadDocument } from '@/hooks/issues/mutations';
import { useIssueDocuments } from '@/hooks/issues/queries';

export interface DocumentsSectionProps {
  issue: IssueDetails;
}

export function DocumentsSection({ issue }: DocumentsSectionProps) {
  const [allVersions, setAllVersions] = useState(false);
  const documents = useIssueDocuments(issue.publicId, allVersions);
  const upload = useUploadDocument(issue.publicId);
  const download = useDownloadDocument();

  return (
    <SectionCard
      title="Reference documents"
      subheader={issue.allowedActions?.canEdit ? 'Usually the supplier’s email. Documents are optional and can be added while the issue is a draft.' : undefined}
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
          upload={
            issue.allowedActions?.canEdit
              ? { onUpload: (file) => upload.mutateAsync(file), uploading: upload.isPending, ...documentUpload }
              : undefined
          }
        />
      )}
    </SectionCard>
  );
}
