import type { CftTeamRow, NoteDetails } from '@cyient/api-client/ecn';
import {
  Button,
  Form,
  FormCheckbox,
  FormInput,
  FormPeoplePicker,
  InlineAlert,
  Modal,
  SectionCard,
  SimpleTable,
  StatusChip,
  useActionFailure,
  useNotify,
  type PersonOption,
  type SimpleColumn,
} from '@cyient/shared-ui';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useCftFunctions } from '../masters/queries';
import { noteKeys } from './keys';
import { useSetCftTeam } from './mutations';
import { isOpenAction } from './status';

interface TeamRowValues {
  functionId: number;
  functionName: string;
  person: PersonOption | null;
  notApplicable: boolean;
  remarks: string;
}

interface TeamFormValues {
  rows: TeamRowValues[];
}

const MAX_REMARKS = 500;

/** The CFT Team tab as a form: a person from the people picker, or Not Applicable, for every function but the initiator's. */
function CftTeamDialog({ note, onClose }: { note: NoteDetails; onClose: () => void }) {
  const notify = useNotify();
  const failed = useActionFailure(noteKeys.detail(note.publicId), { exact: true, onConflict: onClose, fallback: 'The CFT team could not be saved.' });
  const save = useSetCftTeam(note.publicId);
  const form = useForm<TeamFormValues>({
    defaultValues: {
      rows: note.cftTeam
        .filter((row) => !row.isInitiatorRow)
        .map((row) => ({
          functionId: row.functionId,
          functionName: row.functionName,
          person: row.member ? { id: row.member.id, name: row.member.name ?? '' } : null,
          notApplicable: row.notApplicable,
          remarks: row.remarks ?? '',
        })),
    },
  });
  const rows = useWatch({ control: form.control, name: 'rows' });

  const submit = ({ rows: values }: TeamFormValues) => {
    // A function with neither a person nor Not Applicable is left open; the meeting notification waits for it
    const members = values
      .filter((row) => row.notApplicable || row.person)
      .map((row) => ({
        functionId: row.functionId,
        userId: row.notApplicable ? null : (row.person?.id ?? null),
        notApplicable: row.notApplicable,
        remarks: row.remarks.trim() || null,
      }));
    save.mutate(
      { members, version: note.version },
      {
        onSuccess: () => {
          notify.success('CFT team saved.');
          onClose();
        },
        onError: failed,
      },
    );
  };

  return (
    <Modal
      open
      title="CFT team"
      onClose={onClose}
      busy={save.isPending}
      maxWidth="lg"
      actions={
        <>
          <Button onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="team-form" variant="contained" loading={save.isPending}>
            Save
          </Button>
        </>
      }
    >
      <Form form={form} onSubmit={submit} id="team-form">
        <Stack spacing={2} divider={<Divider flexItem />}>
          <Typography variant="body2" color="text.secondary">
            Name one person for each function, or mark it Not Applicable when the change doesn&apos;t concern it. The NPI Engineer row is always
            you, the initiator.
          </Typography>
          {rows.map((row, index) => (
            <Box
              key={row.functionId}
              sx={{ display: 'grid', gap: 2, alignItems: 'center', gridTemplateColumns: { xs: '1fr', md: '180px minmax(0, 2fr) 170px minmax(0, 2fr)' } }}
            >
              <Typography variant="subtitle2" component="h3">
                {row.functionName}
              </Typography>
              <FormPeoplePicker<TeamFormValues> name={`rows.${index}.person`} label={`${row.functionName} member`} disabled={row.notApplicable} />
              <FormCheckbox<TeamFormValues> name={`rows.${index}.notApplicable`} label="Not Applicable" />
              <FormInput<TeamFormValues>
                name={`rows.${index}.remarks`}
                label="Remarks"
                rules={{ maxLength: { value: MAX_REMARKS, message: `Remarks can be at most ${MAX_REMARKS} characters.` } }}
              />
            </Box>
          ))}
        </Stack>
      </Form>
    </Modal>
  );
}

/** What still blocks Send Meeting Notification, as the API says (missingForMeetingNotification). */
export function MissingForMeeting({ note }: { note: NoteDetails }) {
  const missing = note.missingForMeetingNotification ?? [];
  if (note.status !== 'Draft' || missing.length === 0) return null;
  return (
    <InlineAlert severity="warning" title="Before the meeting notification can be sent">
      <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
        {missing.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </Box>
    </InlineAlert>
  );
}

/**
 * The CFT Team tab: every function with its member or Not Applicable, editable while the note is a draft; after the
 * meeting, TCN attendance; after publishing, how many of each function's actions are still open.
 */
export function CftTeamSection({ note }: { note: NoteDetails }) {
  const [editing, setEditing] = useState(false);
  const functions = useCftFunctions();
  const canEdit = note.allowedActions?.canEdit === true;
  const published = note.publishedToCftAt !== null;
  const showAttendance = note.noteType === 'Tcn' && note.status !== 'Draft';
  const actionCount = (functionId: number) => functions.data?.find((f) => f.id === functionId)?.actions.filter((a) => a.isActive).length;

  const columns: SimpleColumn<CftTeamRow>[] = [
    { key: 'function', header: 'Function', render: (row) => row.functionName, width: 200 },
    {
      key: 'member',
      header: 'Member',
      render: (row) =>
        row.member ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <span>{row.member.name}</span>
            {row.isInitiatorRow && <StatusChip label="Initiator" />}
          </Stack>
        ) : row.notApplicable ? (
          <StatusChip label="Not Applicable" />
        ) : (
          <StatusChip label="Not named yet" tone="warning" />
        ),
    },
    { key: 'remarks', header: 'Remarks', render: (row) => row.remarks ?? '' },
    ...(showAttendance
      ? [{ key: 'attended', header: 'Attended', width: 110, render: (row: CftTeamRow) => (row.attended === null ? '—' : row.attended ? 'Yes' : 'No') }]
      : []),
    published
      ? {
          key: 'open',
          header: 'Open actions',
          width: 130,
          render: (row: CftTeamRow) => (row.tabEnabled ? `${row.actions.filter((a) => isOpenAction(a.status)).length} of ${row.actions.length}` : '—'),
        }
      : {
          key: 'predefined',
          header: 'Predefined actions',
          width: 160,
          render: (row: CftTeamRow) => {
            const count = actionCount(row.functionId);
            if (count === undefined) return '';
            return count === 0 && !row.notApplicable ? <StatusChip label="None set up" tone="warning" /> : count;
          },
        },
  ];

  return (
    <Stack spacing={2}>
      <MissingForMeeting note={note} />
      <SectionCard
        title="CFT team"
        subheader={published ? 'Each named member has a tab with their actions.' : 'Each named function gets its predefined actions when the note is published to the CFT.'}
        flush
        actions={
          canEdit && (
            <Button startIcon={<EditOutlinedIcon />} onClick={() => { setEditing(true); }}>
              Edit CFT team
            </Button>
          )
        }
      >
        <SimpleTable<CftTeamRow> aria-label="CFT team" rows={note.cftTeam} columns={columns} getRowKey={(row) => row.functionId} emptyTitle="No CFT functions" />
      </SectionCard>
      {functions.isError && !published && (
        <InlineAlert severity="warning">The predefined actions of each function could not be loaded. The team can still be named.</InlineAlert>
      )}
      {editing && <CftTeamDialog note={note} onClose={() => { setEditing(false); }} />}
    </Stack>
  );
}
