import type { ComplaintDetails } from '@cyient/api-client/cc';
import { DetailList, SectionCard, SimpleTable, StatusChip } from '@cyient/shared-ui';
import { formatDate, formatDateTime } from '@cyient/shared-utils';
import { Link, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import { ContainmentSection } from './ContainmentSection';

interface TeamRow {
  userId: number;
  name: string | null;
  role: string;
  designation: string | null;
  email: string | null;
}

const yesNo = (value: boolean | null) => (value === null ? null : value ? 'Yes' : 'No');
const count = (value: number | null) => (value === null ? null : String(value));

/** D1 to D3: the first page as registered, the team, and the containment actions. */
export function FirstPageSection({ complaint }: { complaint: ComplaintDetails }) {
  const team: TeamRow[] = [
    { userId: complaint.initiator.id, name: complaint.initiator.name, role: 'Initiator', designation: null, email: null },
    ...complaint.teamMembers.map((member) => ({ ...member, role: 'Team member' })),
  ];

  return (
    <Stack spacing={3}>
      <SectionCard title="Customer and complaint">
        <DetailList
          items={[
            { label: 'Customer', value: complaint.customer.name },
            { label: 'Complaint date', value: formatDate(complaint.complaintDate) },
            { label: 'Reported date', value: formatDate(complaint.reportedDate) },
            { label: 'Customer reference', value: complaint.customerReference },
            { label: 'Mode of communication', value: complaint.modeOfCommunication?.name },
            { label: 'Source of complaint', value: complaint.source?.name },
            { label: 'Customer contact', value: complaint.customerContact },
            { label: 'Acknowledgement date', value: formatDate(complaint.acknowledgementDate) },
            { label: 'Location', value: complaint.location?.name },
            { label: 'Critical', value: complaint.isCritical ? <StatusChip label="Critical" tone="error" /> : 'No' },
            {
              label: 'Repeat complaint',
              value: complaint.isRepeat ? (
                complaint.repeatOf ? (
                  <>
                    Yes, of{' '}
                    <Link component={RouterLink} to={`/complaints/${complaint.repeatOf.publicId}`}>
                      {complaint.repeatOf.complaintNo}
                    </Link>{' '}
                    ({formatDate(complaint.repeatOf.complaintDate)})
                  </>
                ) : (
                  'Yes; the earlier complaint is not chosen yet'
                )
              ) : (
                'No'
              ),
            },
            { label: 'Published', value: formatDateTime(complaint.publishedAt) },
            { label: 'Complaint description', value: complaint.complaintDescription, wide: true },
          ]}
        />
      </SectionCard>

      <SectionCard title="Part">
        <DetailList
          items={[
            { label: 'Internal part no', value: complaint.internalPartNo },
            { label: 'Customer part no', value: complaint.customerPartNo },
            { label: 'Revision', value: complaint.revision },
            { label: 'Batch', value: complaint.batch },
            { label: 'Quantity shipped', value: count(complaint.quantityShipped) },
            { label: 'Rejected quantity', value: count(complaint.rejectedQuantity) },
            { label: 'Process / category', value: complaint.processCategory?.name },
            { label: 'Detection stage', value: complaint.detectionStage?.name },
            { label: 'Part description', value: complaint.partDescription, wide: true },
            { label: 'Serial numbers', value: complaint.serialNumbers, wide: true },
          ]}
        />
      </SectionCard>

      <SectionCard title="D2 Problem description">
        <DetailList
          items={[
            { label: 'Problem description', value: complaint.problemDescription, wide: true },
            { label: 'Required', value: yesNo(complaint.required) },
            ...(complaint.required === false ? [{ label: 'Justification', value: complaint.requiredJustification, wide: true }] : []),
          ]}
        />
      </SectionCard>

      <SectionCard title="D1 Team" subheader="The initiator and the team members work on the 8D steps" flush>
        <SimpleTable<TeamRow>
          aria-label="Team"
          rows={team}
          getRowKey={(row) => `${row.role}-${row.userId}`}
          columns={[
            { key: 'name', header: 'Name', render: (row) => row.name },
            { key: 'role', header: 'Role', render: (row) => row.role, width: 140 },
            { key: 'designation', header: 'Designation', render: (row) => row.designation ?? '—' },
            { key: 'email', header: 'Email', render: (row) => row.email ?? '—' },
          ]}
        />
      </SectionCard>

      <ContainmentSection complaint={complaint} />
    </Stack>
  );
}
