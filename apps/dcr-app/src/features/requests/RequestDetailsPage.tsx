import type { RequestDetails } from '@cyient/api-client/dcr';
import {
  ActivityLog,
  Button,
  CheckboxField,
  DetailList,
  DocumentList,
  documentUpload,
  ErrorState,
  errorMessage,
  InlineAlert,
  PageHeader,
  PageLoader,
  SectionCard,
  SectionSkeleton,
  StatusChip,
  useDownloadDocument,
  useFileDownload,
} from '@cyient/shared-ui';
import { formatDate, formatDateTime } from '@cyient/shared-utils';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { Stack, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { useDcrApi } from '../../lib/api';
import { ClausesSection } from './ClausesSection';
import { useUploadDocument } from './mutations';
import { useRequest, useRequestDocuments, useRequestLog } from './queries';
import { releasedInfo, statusInfo } from './status';
import { WorkflowActions } from './WorkflowActions';

const tabs = ['details', 'clauses', 'documents', 'log'] as const;
type TabName = (typeof tabs)[number];

function RequestSummary({ request }: { request: RequestDetails }) {
  return (
    <Stack spacing={3}>
      <SectionCard title="Document request">
        <DetailList
          items={[
            { label: 'Requested by', value: request.requestFrom.name },
            { label: 'Designation', value: request.designation },
            { label: 'Request date', value: formatDate(request.requestDate) },
            { label: 'Location', value: request.location.name },
            { label: 'Department / Function', value: request.department.name },
            { label: 'Need by', value: formatDate(request.needByDate) },
            { label: 'Document reference', value: request.documentReference },
            { label: 'Current revision no', value: request.currentRevisionNo },
            { label: 'Current revision date', value: formatDate(request.currentRevisionDate) },
            { label: 'Document description', value: request.documentDescription, wide: true },
          ]}
        />
      </SectionCard>
      <SectionCard title="Reason and risk">
        <DetailList
          items={[
            { label: 'Reason category', value: request.reasonCategory.name },
            { label: 'Reason for changes', value: request.reasonForChanges, wide: true },
            { label: 'Risk and impact on the QMS', value: request.riskToQms, wide: true },
            { label: 'Risk and impact on the devices', value: request.riskToDevices, wide: true },
          ]}
        />
      </SectionCard>
      <SectionCard title="Reviewers and release">
        <DetailList
          items={[
            { label: 'Department Manager', value: request.deptManager.name },
            { label: 'Department Head', value: request.deptHead.name },
            { label: 'Submitted', value: formatDateTime(request.submittedAt) },
            { label: 'Release date', value: formatDate(request.releaseDate) },
            { label: 'Effective implementation date', value: formatDate(request.effectiveImplementationDate) },
          ]}
        />
      </SectionCard>
    </Stack>
  );
}

function DocumentsSection({ request }: { request: RequestDetails }) {
  const [allVersions, setAllVersions] = useState(false);
  const documents = useRequestDocuments(request.publicId, allVersions);
  const upload = useUploadDocument(request.publicId);
  const download = useDownloadDocument();

  return (
    <SectionCard
      title="Documents"
      subheader={request.allowedActions?.canEdit ? 'A DCR can only be submitted once it has a document.' : undefined}
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
            request.allowedActions?.canEdit
              ? { onUpload: (file) => upload.mutateAsync(file), uploading: upload.isPending, ...documentUpload }
              : undefined
          }
        />
      )}
    </SectionCard>
  );
}

function LogSection({ publicId }: { publicId: string }) {
  const log = useRequestLog(publicId);
  if (log.isPending) return <SectionSkeleton />;
  if (log.isError) return <ErrorState message={errorMessage(log.error)} onRetry={() => void log.refetch()} />;
  return (
    <SectionCard title="Log">
      <ActivityLog
        entries={log.data.map((entry) => ({ at: entry.actionAt, user: entry.user.name, action: entry.action, stage: entry.stageName, comment: entry.comment }))}
      />
    </SectionCard>
  );
}

/** One DCR: its tabs, and the actions the signed-in user may take. Email links open this page. */
export function RequestDetailsPage() {
  const { publicId = '' } = useParams();
  const api = useDcrApi();
  const [params, setParams] = useSearchParams();
  const request = useRequest(publicId);
  const pdf = useFileDownload(() => api.download('/api/v1/requests/{publicId}/pdf', { path: { publicId } }), 'DCR.pdf');
  const tab: TabName = tabs.find((name) => name === params.get('tab')) ?? 'details';

  if (request.isPending) return <PageLoader />;
  if (request.isError) {
    return <ErrorState title="This request could not be opened" message={errorMessage(request.error)} onRetry={() => void request.refetch()} />;
  }

  const details = request.data;
  const title = details.requestNo ?? 'Draft request';

  return (
    <>
      <PageHeader
        title={title}
        subtitle={details.documentReference}
        breadcrumbs={[{ label: 'Requests', to: '/requests' }, { label: title }]}
        status={
          <>
            <StatusChip {...statusInfo[details.status]} />
            {details.status === 'Approved' && <StatusChip {...releasedInfo[details.releasedStatus]} />}
          </>
        }
        actions={
          <>
            <WorkflowActions request={details} />
            {details.status !== 'Draft' && (
              <Button startIcon={<PictureAsPdfOutlinedIcon />} loading={pdf.isPending} onClick={() => { pdf.mutate(); }}>
                PDF
              </Button>
            )}
          </>
        }
      />

      {details.status === 'Draft' && details.reviewStarted && (
        <InlineAlert severity="warning" title="Sent back to you">
          Make the changes asked for in the log, then submit it again. It starts again at IMS Review.
        </InlineAlert>
      )}

      <Tabs
        value={tab}
        onChange={(_, value: TabName) => {
          setParams(value === 'details' ? {} : { tab: value }, { replace: true });
        }}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ my: 2 }}
      >
        <Tab value="details" label="Document request" />
        <Tab value="clauses" label={`Document details (${details.clauses.length})`} />
        <Tab value="documents" label={`Documents${details.documentCount ? ` (${details.documentCount})` : ''}`} />
        <Tab value="log" label="Log" />
      </Tabs>

      {tab === 'details' && <RequestSummary request={details} />}
      {tab === 'clauses' && <ClausesSection request={details} />}
      {tab === 'documents' && <DocumentsSection request={details} />}
      {tab === 'log' && <LogSection publicId={publicId} />}
    </>
  );
}
