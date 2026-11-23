import type { RequestDetails } from '@cyient/api-client/dn';
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
  useAuth,
  useDownloadDocument,
  useFileDownload,
  useTabState,
} from '@cyient/shared-ui';
import { formatDate, formatDateTime } from '@cyient/shared-utils';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { Stack, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router';
import { downloadRequestPdf } from '@/api-callers/requests/request.api';
import { useDnApi } from '@/hooks/useDnApi';
import { useUploadDocument } from '@/hooks/requests/mutations';
import { useRequest, useRequestDocuments, useRequestHistory } from '@/hooks/requests/queries';
import { InformedPeople, ReviewerSequence } from '@/components/requests/ReviewersSection';
import { SerialsSection } from '@/views/requests/detail/SerialsSection';
import { STATUS_ACTIONS, statusInfo } from '@/constants/request-status';
import { DEFAULT_REQUEST_DETAIL_TAB, REQUEST_DETAIL_TABS, type RequestDetailTab } from '@/constants/tab-sections';
import { WorkflowActions } from '@/views/requests/detail/WorkflowActions';

function RequestSummary({ request }: { request: RequestDetails }) {
  return (
    <Stack spacing={3}>
      <SectionCard title="Deviation request">
        <DetailList
          items={[
            { label: 'Initiated by', value: request.initiator.name },
            { label: 'Designation', value: request.designation },
            { label: 'Date', value: formatDate(request.requestDate) },
            { label: 'Initiator department', value: request.initiatorDepartment.name },
            { label: 'W.O no', value: request.workOrderNo },
            { label: 'Line no / cell no / equipment no', value: request.lineCellEquipmentNo },
            { label: 'Customer', value: request.customer.name },
            { label: 'Product FG number', value: request.productFgNumber },
            { label: 'Unit number', value: request.unit.name },
            { label: 'Deviation quantity', value: request.deviationQuantity },
            { label: 'Change category', value: request.changeCategory.name },
            { label: 'Financial year', value: request.financialYear },
          ]}
        />
      </SectionCard>
      <SectionCard title="Deviation details">
        <DetailList
          items={[
            { label: 'Prescribed / defined process', value: request.prescribedProcess, wide: true },
            { label: 'Process change required', value: request.processChangeRequired, wide: true },
            { label: 'Reason for change', value: request.reasonForChange, wide: true },
            { label: 'Action taken to prevent re-occurrence', value: request.preventiveAction, wide: true },
          ]}
        />
      </SectionCard>
      {request.submittedAt && (
        <SectionCard title="Progress">
          <DetailList
            items={[
              { label: 'Submitted', value: formatDateTime(request.submittedAt) },
              { label: 'Pending with', value: request.pendingWith?.name },
              { label: 'Pending role', value: request.pendingRole },
              { label: 'Reporting manager', value: request.reportingManager?.name },
              { label: 'Further approval required', value: request.furtherApprovalRequired === null ? null : request.furtherApprovalRequired ? 'Yes' : 'No' },
              { label: 'Final approval date', value: formatDate(request.finalApprovalDate) },
              { label: 'Valid until', value: formatDate(request.validUntil) },
              { label: 'More details asked for', value: request.moreInfo, wide: true },
              { label: "Initiator's answer", value: request.revertComments, wide: true },
            ]}
          />
        </SectionCard>
      )}
      {(request.status === STATUS_ACTIONS.APPROVED || request.startingSerialNo !== null || request.endingSerialNo !== null) && <SerialsSection request={request} />}
    </Stack>
  );
}

function DocumentsSection({ request }: { request: RequestDetails }) {
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

function HistorySection({ publicId }: { publicId: string }) {
  const history = useRequestHistory(publicId);
  if (history.isPending) return <SectionSkeleton />;
  if (history.isError) return <ErrorState message={errorMessage(history.error)} onRetry={() => void history.refetch()} />;
  return (
    <SectionCard title="History">
      <ActivityLog
        entries={history.data.map((entry) => ({ at: entry.actionAt, user: entry.user.name, action: entry.actionName, stage: entry.stage, comment: entry.comment }))}
      />
    </SectionCard>
  );
}

/** What the page says about where the deviation stands, above the tabs. */
function StateNotice({ request }: { request: RequestDetails }) {
  const { user } = useAuth();
  switch (request.status) {
    case STATUS_ACTIONS.MORE_DETAILS_REQUIRED:
      return request.initiator.id === user.userId ? (
        <InlineAlert severity="warning" title="More details are needed from you">
          {request.moreInfo ?? 'A reviewer asked for more details.'} Add any documents, then resubmit with your answer.
        </InlineAlert>
      ) : (
        <InlineAlert severity="info" title="Waiting for the initiator">
          More details were asked for: {request.moreInfo ?? '—'}
        </InlineAlert>
      );
    case STATUS_ACTIONS.CLOSED_BY_ADMIN:
      return (
        <InlineAlert severity="info" title={`Closed by admin ${formatDateTime(request.closedAt)}`}>
          {request.closeComment ?? 'No comment was given.'}
        </InlineAlert>
      );
    case STATUS_ACTIONS.APPROVED:
      return (
        <InlineAlert severity="success" title="Approved">
          Final approval {formatDate(request.finalApprovalDate)}; valid until {formatDate(request.validUntil)}.
        </InlineAlert>
      );
    case STATUS_ACTIONS.DRAFT:
    case STATUS_ACTIONS.PENDING_APPROVAL:
    case STATUS_ACTIONS.REJECTED:
      return null;
  }
}

/** One deviation: its tabs, and the actions the signed-in user may take. Email links open this page. */
export function RequestDetailsPage() {
  const { publicId = '' } = useParams();
  const api = useDnApi();
  const { activeTab: tab, setTab } = useTabState<RequestDetailTab>({
    defaultTab: DEFAULT_REQUEST_DETAIL_TAB,
    validTabs: REQUEST_DETAIL_TABS,
  });
  const request = useRequest(publicId);
  const pdf = useFileDownload(() => downloadRequestPdf(api, publicId), 'Deviation note.pdf');

  if (request.isPending) return <PageLoader />;
  if (request.isError) {
    return <ErrorState title="This deviation could not be opened" message={errorMessage(request.error)} onRetry={() => void request.refetch()} />;
  }

  const details = request.data;
  const title = details.requestNo ?? 'Draft deviation';

  return (
    <>
      <PageHeader
        title={title}
        subtitle={`${details.changeCategory.name} · W.O ${details.workOrderNo} · ${details.productFgNumber}`}
        breadcrumbs={[{ label: 'Requests', to: '/requests' }, { label: title }]}
        status={<StatusChip {...statusInfo[details.status]} />}
        actions={
          <>
            <WorkflowActions request={details} />
            {details.allowedActions?.canDownloadPdf && (
              <Button startIcon={<PictureAsPdfOutlinedIcon />} loading={pdf.isPending} onClick={() => { pdf.mutate(); }}>
                PDF
              </Button>
            )}
          </>
        }
      />

      <StateNotice request={details} />

      <Tabs
        value={tab}
        onChange={(_, value: RequestDetailTab) => {
          setTab(value);
        }}
        variant="scrollable"
        allowScrollButtonsMobile
        aria-label="Deviation sections"
        sx={{ my: 2 }}
      >
        <Tab value="details" label="Deviation request" />
        <Tab value="reviewers" label={`Reviewers (${details.reviewers.length})`} />
        <Tab value="documents" label={`Documents${details.documentCount ? ` (${details.documentCount})` : ''}`} />
        <Tab value="history" label="History" />
      </Tabs>

      {tab === 'details' && <RequestSummary request={details} />}
      {tab === 'reviewers' && (
        <Stack spacing={3}>
          <ReviewerSequence request={details} />
          <InformedPeople request={details} />
        </Stack>
      )}
      {tab === 'documents' && <DocumentsSection request={details} />}
      {tab === 'history' && <HistorySection publicId={publicId} />}
    </>
  );
}
