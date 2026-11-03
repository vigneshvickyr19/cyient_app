import type { NoteDetails } from '@cyient/api-client/ecn';
import {
  ActivityLog,
  Button,
  DetailList,
  ErrorState,
  errorMessage,
  InlineAlert,
  PageHeader,
  PageLoader,
  SectionCard,
  SectionSkeleton,
  StatusChip,
  useFileDownload,
  type DetailItem,
} from '@cyient/shared-ui';
import { formatDate, formatDateTime } from '@cyient/shared-utils';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { Stack, Tab, Tabs } from '@mui/material';
import { useParams, useSearchParams } from 'react-router';
import { useEcnApi } from '../../lib/api';
import { AttachmentsSection } from './AttachmentsSection';
import { AttendanceSection } from './AttendanceSection';
import { CftTeamSection, MissingForMeeting } from './CftTeamSection';
import { FunctionTab } from './FunctionTab';
import { ImmediateActionsSection, PartsSection } from './LinesSection';
import { useNote, useNoteLog } from './queries';
import { faiLabels, isOpenAction, kindLabels, stageLabel, statusInfo, typeLabels } from './status';
import { WorkflowActions } from './WorkflowActions';

const fixedTabs = ['front', 'team', 'parts', 'immediate', 'attendance', 'attachments', 'log'] as const;
const FUNCTION_TAB = 'function-';

function FrontPage({ note }: { note: NoteDetails }) {
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

function LogSection({ publicId }: { publicId: string }) {
  const log = useNoteLog(publicId);
  if (log.isPending) return <SectionSkeleton />;
  if (log.isError) return <ErrorState message={errorMessage(log.error)} onRetry={() => void log.refetch()} />;
  return (
    <SectionCard title="Log">
      <ActivityLog
        entries={log.data.map((entry) => ({
          at: entry.actionAt,
          user: entry.user.name,
          action: entry.action,
          stage: entry.stageName || stageLabel(entry.stage),
          comment: entry.comment,
        }))}
      />
    </SectionCard>
  );
}

/** One ECN or TCN: its tabs, and the steps the signed-in user may take. Email links open this page (/ecn/notes/{id}). */
export function NoteDetailsPage() {
  const { publicId = '' } = useParams();
  const api = useEcnApi();
  const [params, setParams] = useSearchParams();
  const note = useNote(publicId);
  const pdf = useFileDownload(() => api.download('/api/v1/notes/{publicId}/pdf', { path: { publicId } }), 'ECN.pdf');

  if (note.isPending) return <PageLoader />;
  if (note.isError) {
    return <ErrorState title="This note could not be opened" message={errorMessage(note.error)} onRetry={() => void note.refetch()} />;
  }

  const details = note.data;
  const title = `${typeLabels[details.noteType]} ${details.noteNo}`;
  const functionTabs = details.cftTeam.filter((row) => row.tabEnabled);
  const showAttendance = details.noteType === 'Tcn' && details.status !== 'Draft';
  const editable = details.allowedActions?.editableFunctionIds ?? [];
  const requested = params.get('tab') ?? 'front';
  const tab =
    fixedTabs.find((name) => name === requested && (name !== 'attendance' || showAttendance)) ??
    (functionTabs.some((row) => `${FUNCTION_TAB}${row.functionId}` === requested) ? requested : 'front');
  const openTab = (value: string) => {
    setParams(value === 'front' ? {} : { tab: value }, { replace: true });
  };
  const shownFunction = functionTabs.find((row) => `${FUNCTION_TAB}${row.functionId}` === tab);
  const myTab = functionTabs.find((row) => editable.includes(row.functionId));

  return (
    <>
      <PageHeader
        title={title}
        subtitle={`${details.productNumber} · ${details.customer.name ?? ''}`}
        breadcrumbs={[{ label: details.status === 'Released' ? 'Closed' : 'In progress', to: details.status === 'Released' ? '/closed' : '/notes' }, { label: title }]}
        status={
          <>
            <StatusChip {...statusInfo[details.status]} />
            {details.ecnKind && <StatusChip label={kindLabels[details.ecnKind]} />}
          </>
        }
        actions={
          <>
            <WorkflowActions note={details} />
            <Button startIcon={<PictureAsPdfOutlinedIcon />} loading={pdf.isPending} onClick={() => { pdf.mutate(); }}>
              PDF
            </Button>
          </>
        }
      />

      <Stack spacing={2}>
        {details.allowedActions?.canEdit && tab !== 'team' && <MissingForMeeting note={details} />}
        {details.status === 'Cancelled' && <InlineAlert severity="warning">This note was cancelled. The reason is on the Log.</InlineAlert>}
        {myTab && details.status === 'CftReview' && shownFunction?.functionId !== myTab.functionId && (
          <InlineAlert
            action={
              <Button color="inherit" size="small" onClick={() => { openTab(`${FUNCTION_TAB}${myTab.functionId}`); }}>
                Open
              </Button>
            }
          >
            Your CFT actions are on the {myTab.functionName} tab.
          </InlineAlert>
        )}
      </Stack>

      <Tabs value={tab} onChange={(_, value: string) => { openTab(value); }} variant="scrollable" allowScrollButtonsMobile aria-label="Note tabs" sx={{ my: 2 }}>
        <Tab value="front" label="Front page" />
        <Tab value="team" label="CFT team" />
        <Tab value="parts" label={`ECN parts (${details.parts.length})`} />
        <Tab value="immediate" label={`Immediate actions (${details.immediateActions.length})`} />
        {showAttendance && <Tab value="attendance" label="Attendance" />}
        {functionTabs.map((row) => {
          const open = row.actions.filter((a) => isOpenAction(a.status)).length;
          return <Tab key={row.functionId} value={`${FUNCTION_TAB}${row.functionId}`} label={open > 0 ? `${row.functionName} (${open} open)` : row.functionName} />;
        })}
        <Tab value="attachments" label={`Attachments${details.attachments?.length ? ` (${details.attachments.length})` : ''}`} />
        <Tab value="log" label="Log" />
      </Tabs>

      {tab === 'front' && <FrontPage note={details} />}
      {tab === 'team' && <CftTeamSection note={details} />}
      {tab === 'parts' && <PartsSection note={details} />}
      {tab === 'immediate' && <ImmediateActionsSection note={details} />}
      {tab === 'attendance' && <AttendanceSection key={details.version} note={details} />}
      {shownFunction && <FunctionTab note={details} row={shownFunction} />}
      {tab === 'attachments' && <AttachmentsSection note={details} />}
      {tab === 'log' && <LogSection publicId={publicId} />}
    </>
  );
}
