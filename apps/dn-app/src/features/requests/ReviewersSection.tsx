import type { RequestDetails, ReviewerDetails } from '@cyient/api-client/dn';
import { SectionCard, SimpleTable, StatusChip, type SimpleColumn } from '@cyient/shared-ui';
import { formatDateTime } from '@cyient/shared-utils';
import { Chip, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { inOrder, reviewerKindLabel, reviewerStatusInfo } from './status';

interface ReviewerSequenceProps {
  request: RequestDetails;
  /** Buttons for one step, for administrators. */
  actions?: (reviewer: ReviewerDetails) => ReactNode;
  /** Buttons above the table. */
  headerActions?: ReactNode;
}

/** The reviewer sequence: each step's person, status, review date, remarks and reminders sent. */
export function ReviewerSequence({ request, actions, headerActions }: ReviewerSequenceProps) {
  const rows = inOrder(request.reviewers);
  const columns: SimpleColumn<ReviewerDetails>[] = [
    { key: 'order', header: 'Order', width: 64, render: (row) => rows.indexOf(row) + 1 },
    {
      key: 'step',
      header: 'Step',
      render: (row) => (
        <Stack spacing={0.5}>
          <span>{row.name}</span>
          {row.name !== reviewerKindLabel[row.kind] && (
            <Typography variant="caption" color="text.secondary">
              {reviewerKindLabel[row.kind]}
            </Typography>
          )}
        </Stack>
      ),
    },
    { key: 'person', header: 'Person', render: (row) => row.user.name },
    { key: 'status', header: 'Status', render: (row) => <StatusChip {...reviewerStatusInfo[row.status]} /> },
    { key: 'reviewedAt', header: 'Review date', render: (row) => formatDateTime(row.reviewedAt) || '—' },
    {
      key: 'remarks',
      header: 'Remarks',
      render: (row) => (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          {row.remarks ?? '—'}
        </Typography>
      ),
    },
    { key: 'triggers', header: 'Reminders', align: 'right', width: 96, render: (row) => row.triggerCount },
    ...(actions ? [{ key: 'actions', header: 'Actions', align: 'right' as const, render: actions }] : []),
  ];

  return (
    <SectionCard
      title="Reviewer sequence"
      subheader={request.submittedAt ? 'The deviation goes through these steps in order.' : 'Your reporting manager is added first when you submit.'}
      actions={headerActions}
      flush
    >
      <SimpleTable<ReviewerDetails>
        aria-label="Reviewer sequence"
        rows={rows}
        columns={columns}
        getRowKey={(row) => row.id}
        emptyTitle="No reviewers yet"
        emptyMessage="Choose the people in the change category's boxes on the form."
      />
    </SectionCard>
  );
}

/** The people to be informed: they are emailed when the deviation is approved. */
export function InformedPeople({ request, actions }: { request: RequestDetails; actions?: ReactNode }) {
  return (
    <SectionCard title="People to be informed" subheader="Emailed when the deviation is approved." actions={actions}>
      {request.informedPeople.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nobody else is to be informed.
        </Typography>
      ) : (
        <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}>
          {request.informedPeople.map((person) => (
            <Chip key={person.id} label={person.name ?? 'Unknown'} variant="outlined" />
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}
