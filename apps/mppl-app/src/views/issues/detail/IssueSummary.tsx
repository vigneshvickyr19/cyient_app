import type { EscalationItem, IssueDetails } from '@cyient/api-client/mppl';
import { DetailList, SectionCard, SimpleTable } from '@cyient/shared-ui';
import { formatCurrency, formatDate, formatDateTime, formatNumber } from '@cyient/shared-utils';
import { Stack } from '@mui/material';
import { STATUS_ACTIONS } from '@/constants/issue-status';

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

export interface IssueSummaryProps {
  issue: IssueDetails;
}

export function IssueSummary({ issue }: IssueSummaryProps) {
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
      {issue.status !== STATUS_ACTIONS.DRAFT && <EscalationsSection escalations={issue.escalations} />}
      {issue.status === STATUS_ACTIONS.CLOSED && (
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
