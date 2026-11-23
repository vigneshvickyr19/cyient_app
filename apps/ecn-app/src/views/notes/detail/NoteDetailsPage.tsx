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
  useTabState,
  type DetailItem,
} from '@cyient/shared-ui';
import { formatDate, formatDateTime } from '@cyient/shared-utils';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { Stack, Tab, Tabs } from '@mui/material';
import { useParams } from 'react-router';
import { downloadNotePdf } from '@/api-callers/notes/note.api';
import { useEcnApi } from '@/hooks/useEcnApi';
import { AttachmentsSection } from '@/views/notes/detail/AttachmentsSection';
import { AttendanceSection } from '@/views/notes/detail/AttendanceSection';
import { CftTeamSection, MissingForMeeting } from '@/views/notes/detail/CftTeamSection';
import { FunctionTab } from '@/views/notes/detail/FunctionTab';
import { ImmediateActionsSection, PartsSection } from '@/views/notes/detail/LinesSection';
import { useNote, useNoteLog } from '@/hooks/notes/queries';
import { faiLabels, isOpenAction, kindLabels, stageLabel, STATUS_ACTIONS, statusInfo, typeLabels } from '@/constants/note-status';
import { DEFAULT_NOTE_DETAIL_TAB, FUNCTION_TAB_PREFIX, NOTE_DETAIL_FIXED_TABS, type NoteDetailFixedTab } from '@/constants/tab-sections';
import { WorkflowActions } from '@/views/notes/detail/WorkflowActions';

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
  const note = useNote(publicId);
  const pdf = useFileDownload(() => downloadNotePdf(api, publicId), 'ECN.pdf');
  const { activeTab: tab, setTab: openTab } = useTabState<string>({
    defaultTab: DEFAULT_NOTE_DETAIL_TAB,
    validTabs: NOTE_DETAIL_FIXED_TABS,
    isValidTab: (name) => NOTE_DETAIL_FIXED_TABS.includes(name as NoteDetailFixedTab) || name.startsWith(FUNCTION_TAB_PREFIX),
  });

  if (note.isPending) return <PageLoader />;
  if (note.isError) {
    return <ErrorState title="This note could not be opened" message={errorMessage(note.error)} onRetry={() => void note.refetch()} />;
  }

  const details = note.data;
  const title = `${typeLabels[details.noteType]} ${details.noteNo}`;
  const functionTabs = details.cftTeam.filter((row) => row.tabEnabled);
  const showAttendance = details.noteType === 'Tcn' && details.status !== STATUS_ACTIONS.DRAFT;
  const editable = details.allowedActions?.editableFunctionIds ?? [];
  const shownFunction = functionTabs.find((row) => `${FUNCTION_TAB_PREFIX}${row.functionId}` === tab);
  const activeTab =
    (tab === 'attendance' && !showAttendance) || (tab.startsWith(FUNCTION_TAB_PREFIX) && !shownFunction)
      ? DEFAULT_NOTE_DETAIL_TAB
      : tab;
  const myTab = functionTabs.find((row) => editable.includes(row.functionId));

  return (
    <>
      <PageHeader
        title={title}
        subtitle={`${details.productNumber} · ${details.customer.name ?? ''}`}
        breadcrumbs={[{ label: details.status === STATUS_ACTIONS.RELEASED ? 'Closed' : 'In progress', to: details.status === STATUS_ACTIONS.RELEASED ? '/closed' : '/notes' }, { label: title }]}
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
        {details.allowedActions?.canEdit && activeTab !== 'team' && <MissingForMeeting note={details} />}
        {details.status === STATUS_ACTIONS.CANCELLED && <InlineAlert severity="warning">This note was cancelled. The reason is on the Log.</InlineAlert>}
        {myTab && details.status === STATUS_ACTIONS.CFT_REVIEW && shownFunction?.functionId !== myTab.functionId && (
          <InlineAlert
            action={
              <Button color="inherit" size="small" onClick={() => { openTab(`${FUNCTION_TAB_PREFIX}${myTab.functionId}`); }}>
                Open
              </Button>
            }
          >
            Your CFT actions are on the {myTab.functionName} tab.
          </InlineAlert>
        )}
      </Stack>

      <Tabs value={activeTab} onChange={(_, value: string) => { openTab(value); }} variant="scrollable" allowScrollButtonsMobile aria-label="Note tabs" sx={{ my: 2 }}>
        <Tab value="front" label="Front page" />
        <Tab value="team" label="CFT team" />
        <Tab value="parts" label={`ECN parts (${details.parts.length})`} />
        <Tab value="immediate" label={`Immediate actions (${details.immediateActions.length})`} />
        {showAttendance && <Tab value="attendance" label="Attendance" />}
        {functionTabs.map((row) => {
          const open = row.actions.filter((a) => isOpenAction(a.status)).length;
          return <Tab key={row.functionId} value={`${FUNCTION_TAB_PREFIX}${row.functionId}`} label={open > 0 ? `${row.functionName} (${open} open)` : row.functionName} />;
        })}
        <Tab value="attachments" label={`Attachments${details.attachments?.length ? ` (${details.attachments.length})` : ''}`} />
        <Tab value="log" label="Log" />
      </Tabs>

      {activeTab === 'front' && <FrontPage note={details} />}
      {activeTab === 'team' && <CftTeamSection note={details} />}
      {activeTab === 'parts' && <PartsSection note={details} />}
      {activeTab === 'immediate' && <ImmediateActionsSection note={details} />}
      {activeTab === 'attendance' && <AttendanceSection key={details.version} note={details} />}
      {shownFunction && <FunctionTab note={details} row={shownFunction} />}
      {activeTab === 'attachments' && <AttachmentsSection note={details} />}
      {activeTab === 'log' && <LogSection publicId={publicId} />}
    </>
  );
}
