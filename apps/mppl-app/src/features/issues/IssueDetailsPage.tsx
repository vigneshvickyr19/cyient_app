import type { EscalationItem, IssueDetails } from '@cyient/api-client/mppl';
import {
  ActivityLog,
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
  SimpleTable,
  StatusChip,
  useDownloadDocument,
} from '@cyient/shared-ui';
import { formatCurrency, formatDate, formatDateTime, formatNumber } from '@cyient/shared-utils';
import { Stack, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { IssueActions } from './IssueActions';
import { useUploadDocument } from './mutations';
import { useIssue, useIssueDocuments, useIssueLog } from './queries';
import { issueTitle, statusInfo } from './status';

const tabs = ['details', 'documents', 'log'] as const;
type TabName = (typeof tabs)[number];

/** File types the API accepts for a reference document (Platform:Files:AllowedExtensions). */

function EscalationsSection({ escalations }: { escalations: readonly EscalationItem[] }) {
  return (
    <SectionCard title="Escalations reached" subheader="Each level is emailed in turn while the issue stays open." flush>
      <SimpleTable<EscalationItem>
        aria-label="Escalations reached"
        rows={escalations}
        getRowKey={(row) => row.level}
        columns={[
          { key: 'level', header: 'Level', render: (row) => row.levelName, width: 200 },
          { key: 'person', header: 'Emailed', render: (row) => row.escalatedTo?.name ?? '—' },
          { key: 'at', header: 'On', render: (row) => formatDateTime(row.escalatedAt), width: 190 },
        ]}
        emptyTitle="Not escalated"
        emptyMessage="The issue is still with its Sourcing Lead."
      />
    </SectionCard>
  );
}

function IssueSummary({ issue }: { issue: IssueDetails }) {
  return (
    <Stack spacing={3}>
      <SectionCard title="Issue">
        <DetailList
          items={[
            { label: 'Project', value: issue.project.name },
            { label: 'Commodity', value: issue.commodity.name },
            { label: 'Issue', value: issue.issueType.name },
            { label: 'Raised by', value: issue.raisedBy.name },
            { label: 'Saved on', value: formatDateTime(issue.createdAt) },
            { label: 'Submitted on', value: formatDateTime(issue.submittedAt) },
            { label: 'Remarks', value: issue.remarks, wide: true },
          ]}
        />
      </SectionCard>
      <SectionCard title="PO line">
        <DetailList
          items={[
            { label: 'PO number', value: issue.poNumber },
            { label: 'PO line', value: issue.poLineNumber },
            { label: 'PO date', value: formatDate(issue.poDate) },
            { label: 'Part number', value: issue.partNumber },
            { label: 'Quantity', value: formatNumber(issue.quantity) },
            { label: 'Supplier', value: issue.supplierName },
            { label: 'MPN', value: issue.mpn },
            { label: 'Make', value: issue.make },
            { label: 'MOQ', value: formatNumber(issue.moqQuantity) },
            { label: 'System price', value: formatNumber(issue.systemPrice, 4) },
            { label: 'Currency', value: issue.currency },
          ]}
        />
      </SectionCard>
      <SectionCard title="Change requested">
        <DetailList
          items={[
            { label: 'New price', value: formatNumber(issue.newPrice, 4) },
            { label: 'New quantity', value: formatNumber(issue.newQuantity) },
            { label: 'Value impact', value: formatCurrency(issue.valueImpact, issue.currency) },
          ]}
        />
      </SectionCard>
      <SectionCard title="Sourcing">
        <DetailList
          items={[
            { label: 'Sourcing Lead', value: issue.sourcingLead.name },
            { label: 'Pending with', value: issue.pendingWith },
            { label: 'Customer', value: issue.customerName },
            { label: 'Customer group', value: issue.customerGroup },
            { label: 'Segment', value: issue.segment },
            { label: 'Escalation level 1', value: issue.escalation1?.name },
            { label: 'Escalation level 2', value: issue.escalation2?.name },
            { label: 'Escalation level 3', value: issue.escalation3?.name },
          ]}
        />
      </SectionCard>
      {issue.status !== 'Draft' && <EscalationsSection escalations={issue.escalations} />}
      {issue.status === 'Closed' && (
        <SectionCard title="Closure">
          <DetailList
            items={[
              { label: 'Closed by', value: issue.closedBy?.name },
              { label: 'Closed on', value: formatDateTime(issue.closedAt) },
              { label: 'Sourcing comment', value: issue.sourcingComment, wide: true },
            ]}
          />
        </SectionCard>
      )}
    </Stack>
  );
}

function DocumentsSection({ issue }: { issue: IssueDetails }) {
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

function LogSection({ publicId }: { publicId: string }) {
  const log = useIssueLog(publicId);
  if (log.isPending) return <SectionSkeleton />;
  if (log.isError) return <ErrorState message={errorMessage(log.error)} onRetry={() => void log.refetch()} />;
  return (
    <SectionCard title="Log">
      <ActivityLog
        entries={log.data.map((entry) => ({ at: entry.actionAt, user: entry.user.name, action: entry.actionName, stage: entry.stageName, comment: entry.comment }))}
      />
    </SectionCard>
  );
}

/** One issue: its details, documents and log, and the actions the signed-in user may take. Email links open this page. */
export function IssueDetailsPage() {
  const { publicId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const issue = useIssue(publicId);
  const tab: TabName = tabs.find((name) => name === params.get('tab')) ?? 'details';

  if (issue.isPending) return <PageLoader />;
  if (issue.isError) {
    return <ErrorState title="This issue could not be opened" message={errorMessage(issue.error)} onRetry={() => void issue.refetch()} />;
  }

  const details = issue.data;
  const title = issueTitle(details);
  const listLink = details.status === 'Draft' ? '/issues?list=Drafts' : details.status === 'Closed' ? '/issues?list=Fixed' : '/issues';

  return (
    <>
      <PageHeader
        title={title}
        subtitle={[details.partNumber, details.supplierName, details.issueType.name].filter(Boolean).join(' · ')}
        breadcrumbs={[{ label: 'Issues', to: listLink }, { label: title }]}
        status={<StatusChip {...statusInfo[details.status]} />}
        actions={<IssueActions issue={details} />}
      />

      {details.status === 'Open' && details.pendingWith && (
        <InlineAlert>
          Pending with {details.pendingWith} since {formatDate(details.submittedAt)}.
        </InlineAlert>
      )}
      {details.allowedActions?.canSubmit && (
        <InlineAlert>Add the reference documents if you have them, then submit the issue to its Sourcing Lead.</InlineAlert>
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
        <Tab value="details" label="Details" />
        <Tab value="documents" label={`Documents${details.documentCount ? ` (${details.documentCount})` : ''}`} />
        <Tab value="log" label="Log" />
      </Tabs>

      {tab === 'details' && <IssueSummary issue={details} />}
      {tab === 'documents' && <DocumentsSection issue={details} />}
      {tab === 'log' && <LogSection publicId={publicId} />}
    </>
  );
}
