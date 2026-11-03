import type { CftActionDetails, CftActionStatus, CftTeamRow, NoteDetails } from '@cyient/api-client/ecn';
import {
  applyServerErrors,
  Button,
  DocumentList,
  Form,
  FormDatePicker,
  FormDropdown,
  FormInput,
  FormTextArea,
  InlineAlert,
  Modal,
  SectionCard,
  SimpleTable,
  StatusChip,
  useActionFailure,
  useFileDownload,
  useNotify,
  type SimpleColumn,
} from '@cyient/shared-ui';
import { formatDate, maxLength, textOrNull } from '@cyient/shared-utils';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useEcnApi } from '../../lib/api';
import { toDocumentItems } from './attachments';
import { noteKeys } from './keys';
import { useUpdateCftAction } from './mutations';
import { actionStatusInfo, actionStatusOptions, isOpenAction } from './status';
import { useDocumentUpload } from './useDocumentUpload';

interface CftActionFormValues {
  status: CftActionStatus | null;
  targetDate: string | null;
  closedDate: string | null;
  comments: string;
  fromRevision: string;
  toRevision: string;
  dispositionStatus: string;
  itemAffected: string;
  rawMaterial: string;
}

/** RULE-07: closing an action needs its target and closed dates. */
const neededToClose =
  (message: string) =>
  (value: unknown, values: CftActionFormValues): true | string =>
    values.status !== 'Closed' || Boolean(value) || message;

/** The NPI Engineer tab's attachments of one action: download, and upload while the tab is the user's. */
function ActionAttachments({ note, action, editable }: { note: NoteDetails; action: CftActionDetails; editable: boolean }) {
  const api = useEcnApi();
  const uploadFor = useDocumentUpload(note.publicId);
  const download = useFileDownload((fileId: number) => api.download('/api/v1/attachments/{fileId}', { path: { fileId } }));
  const files = toDocumentItems((note.attachments ?? []).filter((a) => a.kind === 'CftAction' && a.cftActionId === action.id));

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" component="h3">
        Attachments
      </Typography>
      <DocumentList
        files={files}
        onDownload={(file) => { download.mutate(file.id); }}
        downloading={(file) => download.isPending && download.variables === file.id}
        emptyMessage="No documents for this action."
        upload={editable ? uploadFor('CftAction', action.id) : undefined}
      />
    </Stack>
  );
}

/** One predefined action as its member updates it: status, dates, comments, the Tracker's details and, on the NPI tab, revisions. */
function CftActionDialog({ note, row, action, onClose }: { note: NoteDetails; row: CftTeamRow; action: CftActionDetails; onClose: () => void }) {
  const notify = useNotify();
  const failed = useActionFailure(noteKeys.detail(note.publicId), { exact: true, onConflict: onClose, fallback: 'The action could not be saved.' });
  const save = useUpdateCftAction(note.publicId);
  const isNpiTab = row.isInitiatorRow;
  const form = useForm<CftActionFormValues>({
    defaultValues: {
      status: action.status,
      targetDate: action.targetDate,
      closedDate: action.closedDate,
      comments: action.comments ?? '',
      fromRevision: action.fromRevision ?? '',
      toRevision: action.toRevision ?? '',
      dispositionStatus: action.dispositionStatus ?? '',
      itemAffected: action.itemAffected ?? '',
      rawMaterial: action.rawMaterial ?? '',
    },
  });

  const submit = (values: CftActionFormValues) => {
    save.mutate(
      {
        actionId: action.id,
        input: {
          status: values.status,
          targetDate: values.targetDate,
          closedDate: values.closedDate,
          comments: textOrNull(values.comments),
          fromRevision: isNpiTab ? textOrNull(values.fromRevision) : null,
          toRevision: isNpiTab ? textOrNull(values.toRevision) : null,
          dispositionStatus: textOrNull(values.dispositionStatus),
          itemAffected: textOrNull(values.itemAffected),
          rawMaterial: textOrNull(values.rawMaterial),
          version: action.version,
        },
      },
      {
        onSuccess: (updated) => {
          notify.success(
            updated.status === 'CftClosed' ? 'Action saved. Every CFT action is closed; the initiator can publish the note to the Reviewer.' : 'Action saved.',
          );
          onClose();
        },
        onError: (error) => {
          if (!applyServerErrors(error, form)) failed(error);
        },
      },
    );
  };

  const grid = { display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' } } as const;

  return (
    <Modal
      open
      title={`${row.functionName}: action ${action.sortOrder}`}
      onClose={onClose}
      busy={save.isPending}
      maxWidth="md"
      actions={
        <>
          <Button onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="cft-action-form" variant="contained" loading={save.isPending}>
            Save
          </Button>
        </>
      }
    >
      <Stack spacing={2} divider={<Divider flexItem />}>
        <Form form={form} onSubmit={submit} id="cft-action-form">
          <Stack spacing={2}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {action.actionText}
            </Typography>
            <Box sx={grid}>
              <FormDropdown<CftActionFormValues, CftActionStatus> name="status" label="Status" options={actionStatusOptions} rules={{ required: 'Status is required.' }} />
              <FormDatePicker<CftActionFormValues> name="targetDate" label="Target date" rules={{ validate: neededToClose('Target date is required to close an action.') }} />
              <FormDatePicker<CftActionFormValues> name="closedDate" label="Closed date" rules={{ validate: neededToClose('Closed date is required to close an action.') }} />
            </Box>
            {isNpiTab && (
              <Box sx={grid}>
                <FormInput<CftActionFormValues> name="fromRevision" label="From revision" rules={maxLength(50, 'From revision')} />
                <FormInput<CftActionFormValues> name="toRevision" label="To revision" rules={maxLength(50, 'To revision')} />
              </Box>
            )}
            <FormTextArea<CftActionFormValues> name="comments" label="Comments" minRows={2} rules={maxLength(2000, 'Comments')} />
            <Typography variant="subtitle2" component="h3">
              For the ECN Tracker
            </Typography>
            <Box sx={grid}>
              <FormInput<CftActionFormValues> name="dispositionStatus" label="Disposition status" rules={maxLength(200, 'Disposition status')} />
              <FormInput<CftActionFormValues> name="itemAffected" label="Item affected" rules={maxLength(500, 'Item affected')} />
              <FormInput<CftActionFormValues> name="rawMaterial" label="Raw material" rules={maxLength(500, 'Raw material')} />
            </Box>
          </Stack>
        </Form>
        {isNpiTab && <ActionAttachments note={note} action={action} editable />}
      </Stack>
    </Modal>
  );
}

/**
 * One function's tab after publishing to the CFT: its predefined actions. Only the function's member updates them
 * (the initiator updates the NPI Engineer tab); everyone else sees them.
 */
export function FunctionTab({ note, row }: { note: NoteDetails; row: CftTeamRow }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const editable = note.allowedActions?.editableFunctionIds.includes(row.functionId) === true;
  const editing = row.actions.find((a) => a.id === editingId) ?? null;
  const attachmentCount = (actionId: number) => (note.attachments ?? []).filter((a) => a.kind === 'CftAction' && a.cftActionId === actionId).length;
  const open = row.actions.filter((a) => isOpenAction(a.status)).length;

  const columns: SimpleColumn<CftActionDetails>[] = [
    { key: 'no', header: 'No', render: (a) => a.sortOrder, width: 56 },
    { key: 'action', header: 'Action', render: (a) => <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{a.actionText}</Typography> },
    { key: 'status', header: 'Status', render: (a) => <StatusChip {...actionStatusInfo[a.status]} />, width: 140 },
    { key: 'targetDate', header: 'Target date', render: (a) => formatDate(a.targetDate) || '—', width: 120 },
    { key: 'closedDate', header: 'Closed date', render: (a) => formatDate(a.closedDate) || '—', width: 120 },
    {
      key: 'comments',
      header: 'Comments',
      render: (a) => {
        const tracker = [
          a.dispositionStatus && `Disposition: ${a.dispositionStatus}`,
          a.itemAffected && `Item affected: ${a.itemAffected}`,
          a.rawMaterial && `Raw material: ${a.rawMaterial}`,
        ].filter(Boolean);
        return (
          <Stack spacing={0.5}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {a.comments ?? '—'}
            </Typography>
            {tracker.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {tracker.join(' · ')}
              </Typography>
            )}
          </Stack>
        );
      },
    },
    ...(row.isInitiatorRow
      ? [
          {
            key: 'revision',
            header: 'Revision',
            width: 140,
            render: (a: CftActionDetails) => (a.fromRevision || a.toRevision ? `${a.fromRevision ?? '—'} → ${a.toRevision ?? '—'}` : '—'),
          },
          { key: 'files', header: 'Attachments', width: 110, render: (a: CftActionDetails) => attachmentCount(a.id) || '—' },
        ]
      : []),
    {
      key: 'edit',
      header: editable ? 'Update' : '',
      align: 'right',
      width: 80,
      render: (a) =>
        editable ? (
          <Tooltip title="Update">
            <IconButton aria-label={`Update action ${a.sortOrder}`} onClick={() => { setEditingId(a.id); }}>
              <EditOutlinedIcon />
            </IconButton>
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <Stack spacing={2}>
      {editable && note.status === 'CftReview' && (
        <InlineAlert>
          These are your actions. Close each one with its target and closed dates, or mark it Not Applicable. When the last one closes, the initiator can
          publish the note to the Reviewer.
        </InlineAlert>
      )}
      <SectionCard title={row.functionName} subheader={`${row.member?.name ?? 'Nobody named'} · ${open} of ${row.actions.length} actions open`} flush>
        <SimpleTable<CftActionDetails>
          aria-label={`${row.functionName} actions`}
          rows={[...row.actions].sort((a, b) => a.sortOrder - b.sortOrder)}
          columns={columns}
          getRowKey={(a) => a.id}
          emptyTitle="No actions"
        />
      </SectionCard>
      {editing && <CftActionDialog note={note} row={row} action={editing} onClose={() => { setEditingId(null); }} />}
    </Stack>
  );
}
