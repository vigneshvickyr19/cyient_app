import {
  Button,
  ErrorState,
  errorMessage,
  InlineAlert,
  PageHeader,
  PageLoader,
  StatusChip,
  SegmentedTabs,
  Tab,
  useFileDownload,
  useTabState,
} from '@cyient/shared-ui';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { Stack } from '@mui/material';
import { useParams } from 'react-router';
import { downloadNotePdf } from '@/api-callers/notes/note.api';
import { useEcnApi } from '@/hooks/useEcnApi';
import { MissingForMeeting } from '@/views/notes/detail/CftTeamSection';
import { useNote } from '@/hooks/notes/queries';
import { kindLabels, STATUS_ACTIONS, statusInfo, typeLabels } from '@/constants/note-status';
import {
  DEFAULT_NOTE_DETAIL_TAB,
  FUNCTION_TAB_PREFIX,
  NOTE_DETAIL_FIXED_TABS,
  getNoteDetailTabs,
  renderNoteDetailTab,
  type NoteDetailFixedTab,
} from '@/constants/tab-sections';
import { WorkflowActions } from '@/views/notes/detail/WorkflowActions';

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

      {(() => {
        const tabContext = {
          note: details,
          publicId,
          showAttendance,
          functionTabs,
          shownFunction,
        };
        return (
          <>
            <SegmentedTabs value={activeTab} onChange={(_, value: string) => { openTab(value); }} variant="scrollable" allowScrollButtonsMobile aria-label="Note tabs" sx={{ my: 2 }}>
              {getNoteDetailTabs(tabContext).map((tabItem) => (
                <Tab key={tabItem.key} value={tabItem.key} label={tabItem.label} />
              ))}
            </SegmentedTabs>

            {renderNoteDetailTab(activeTab, tabContext)}
          </>
        );
      })()}
    </>
  );
}
