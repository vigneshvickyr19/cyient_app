import type { NoteDetails } from '@cyient/api-client/ecn';
import { DetailList, SectionCard, type DetailItem } from '@cyient/shared-ui';
import { formatDate, formatDateTime } from '@cyient/shared-utils';
import { Stack } from '@mui/material';
import { faiLabels, kindLabels, typeLabels } from '@/constants/note-status';

export interface FrontPageProps {
  note: NoteDetails;
}

export function FrontPage({ note }: FrontPageProps) {
  const isEcn = note.noteType === 'Ecn';
  const identity: DetailItem[] = [
    { label: isEcn ? 'ECN number' : 'TCN number', value: note.noteNo },
    { label: 'Type', value: [typeLabels[note.noteType], note.ecnKind ? kindLabels[note.ecnKind] : null].filter(Boolean).join(' · ') },
    ...(note.ecnKind === 'Sap' ? [{ label: 'SAP ECN date', value: formatDate(note.sapEcnDate) }] : []),
    { label: 'Initiator', value: note.initiator.name },
    { label: 'Created', value: formatDateTime(note.createdAt) },
    { label: 'ECN implementation date', value: formatDate(note.implementationDate) },
  ];
  const product: DetailItem[] = [
    { label: 'Product number', value: note.productNumber },
    { label: 'Product revision number', value: note.productRevisionNumber },
    { label: 'Customer name', value: note.customer.name },
    { label: 'Customer product number', value: note.customerProductNumber },
    ...(isEcn
      ? [
          { label: 'Customer ECN number', value: note.customerEcnNumber },
          { label: 'Customer ECN date', value: formatDate(note.customerEcnDate) },
        ]
      : [
          { label: 'Customer TCN number', value: note.customerTcnNumber },
          { label: 'Effective product serial number', value: note.effectiveSerialNumber, wide: true },
        ]),
    { label: 'Product description (card type)', value: note.productDescription, wide: true },
  ];
  const change: DetailItem[] = [
    { label: 'Category 1', value: note.category1.name },
    { label: 'Category 2', value: note.category2.name },
    { label: 'FAI', value: faiLabels[note.fai] },
    { label: 'ECR approval from customer', value: note.ecrApprovalFromCustomer ? 'Yes' : 'No' },
    { label: 'Summary of change', value: note.summary, wide: true },
    ...(isEcn ? [] : [{ label: 'Reason for change', value: note.reasonForChange, wide: true }]),
    { label: 'Comments', value: note.comments, wide: true },
  ];
  const progress: DetailItem[] = [
    { label: 'Reviewer', value: note.reviewer.name },
    { label: 'Approver', value: note.approver.name },
    { label: 'ECN target date', value: formatDate(note.targetDate) },
    { label: 'Meeting notification sent', value: formatDateTime(note.meetingNotifiedAt) },
    { label: 'Published to the CFT', value: formatDateTime(note.publishedToCftAt) },
    { label: 'CFT actions closed', value: formatDateTime(note.cftClosedAt) },
    { label: 'Approved', value: formatDateTime(note.approvedAt) },
    { label: 'Released', value: formatDateTime(note.releasedAt) },
  ];

  return (
    <Stack spacing={3}>
      <SectionCard title={isEcn ? 'ECN' : 'TCN'}>
        <DetailList items={identity} />
      </SectionCard>
      <SectionCard title="Product and customer">
        <DetailList items={product} />
      </SectionCard>
      <SectionCard title="The change">
        <DetailList items={change} />
      </SectionCard>
      <SectionCard title="Reviewer, Approver and progress">
        <DetailList items={progress} columns={4} />
      </SectionCard>
    </Stack>
  );
}
