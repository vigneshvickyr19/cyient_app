import type { ActionDetails, ComplaintDetails } from '@cyient/api-client/cc';
import {
  applyServerErrors,
  Button,
  ConfirmDialog,
  documentUpload,
  FileUpload,
  Form,
  FormDatePicker,
  FormPeoplePicker,
  FormTextArea,
  InlineAlert,
  Modal,
  SectionCard,
  SimpleTable,
  StatusChip,
  useActionFailure,
  useDownloadDocument,
  useNotify,
  type PersonOption,
  type SimpleColumn,
} from '@cyient/shared-ui';
import { businessToday, formatDate, formatDateTime, maxLength, textOrNull } from '@cyient/shared-utils';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, IconButton, Link, Stack, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { complaintKeys } from './keys';
import { useCloseAction, useDeleteAction, useSaveAction, useUploadEvidence, useWorkflowAction } from './mutations';
import { actionStatusInfo } from './status';

const LONG_TEXT = 4000;

interface ActionFormValues {
  description: string;
  owner: PersonOption | null;
  targetDate: string | null;
}

const serverFieldNames = { ownerUserId: 'owner' } as const;

function ActionDialog({ publicId, action, onClose }: { publicId: string; action: ActionDetails | null; onClose: () => void }) {
  const notify = useNotify();
  const failed = useActionFailure(complaintKeys.detail(publicId));
  const save = useSaveAction(publicId);
  const form = useForm<ActionFormValues>({
    defaultValues: {
      description: action?.description ?? '',
      owner: action ? { id: action.owner.id, name: action.owner.name ?? '' } : null,
      targetDate: action?.targetDate ?? null,
    },
  });

  const submit = (values: ActionFormValues) => {
    save.mutate(
      {
        actionId: action?.id ?? null,
        input: { description: values.description.trim(), ownerUserId: values.owner?.id ?? null, targetDate: values.targetDate, version: action?.version ?? null },
      },
      {
        onSuccess: () => {
          notify.success(action ? 'Action changed.' : 'Action added. Its owner is emailed.');
          onClose();
        },
        onError: (error) => {
          if (!applyServerErrors(error, form, serverFieldNames)) failed(error);
        },
      },
    );
  };

  return (
    <Modal
      open
      title={action ? 'Change the action' : 'Add an action'}
      onClose={onClose}
      busy={save.isPending}
      maxWidth="md"
      actions={
        <>
          <Button onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="action-form" variant="contained" loading={save.isPending}>
            {action ? 'Save' : 'Add'}
          </Button>
        </>
      }
    >
      <Form form={form} onSubmit={submit} id="action-form">
        <Stack spacing={2}>
          <FormTextArea<ActionFormValues>
            name="description"
            label="Action"
            rules={{
              required: 'The action is required.',
              validate: (value) => (typeof value === 'string' && value.trim() !== '') || 'The action is required.',
              ...maxLength(LONG_TEXT, 'The action'),
            }}
          />
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } }}>
            <FormPeoplePicker<ActionFormValues>
              name="owner"
              label="Responsible person"
              helperText="They are emailed and see it in their pending actions."
              rules={{ required: 'The responsible person is required.' }}
            />
            <FormDatePicker<ActionFormValues>
              name="targetDate"
              label="Target date"
              minDate={action?.targetDate && action.targetDate < businessToday() ? action.targetDate : businessToday()}
              rules={{
                required: 'The target date is required.',
                // A date already set may have passed; a new or changed one must be today or later
                validate: (value) =>
                  typeof value !== 'string' || value === action?.targetDate || value >= businessToday() || "The target date can't be in the past.",
              }}
            />
          </Box>
        </Stack>
      </Form>
    </Modal>
  );
}

interface CloseValues {
  remarks: string;
}

/** The owner's dialog: evidence is uploaded straight away; closing needs at least one piece of it (BR-05). */
function CloseActionDialog({ publicId, action, onClose }: { publicId: string; action: ActionDetails; onClose: () => void }) {
  const notify = useNotify();
  const failed = useActionFailure(complaintKeys.detail(publicId));
  const upload = useUploadEvidence(publicId);
  const close = useCloseAction(publicId);
  const download = useDownloadDocument();
  const [chosen, setChosen] = useState<File[]>([]);
  const [tried, setTried] = useState(false);
  const form = useForm<CloseValues>({ defaultValues: { remarks: '' } });
  const missingEvidence = action.evidence.length === 0;

  const submit = (values: CloseValues) => {
    setTried(true);
    if (missingEvidence) return;
    close.mutate(
      { actionId: action.id, input: { remarks: textOrNull(values.remarks), version: action.version } },
      {
        onSuccess: () => {
          notify.success('Action closed. The initiator is emailed.');
          onClose();
        },
        onError: (error) => {
          if (!applyServerErrors(error, form)) failed(error);
        },
      },
    );
  };

  return (
    <Modal
      open
      title="Close the action"
      onClose={onClose}
      busy={close.isPending || upload.isPending}
      maxWidth="md"
      actions={
        <>
          <Button onClick={onClose} disabled={close.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="close-action-form" variant="contained" loading={close.isPending}>
            Close action
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          {action.description}
        </Typography>

        <Box>
          <Typography variant="subtitle2" component="h3" gutterBottom>
            Evidence
          </Typography>
          {missingEvidence ? (
            <Typography variant="body2" color="text.secondary">
              No evidence yet. Evidence is kept as soon as it is uploaded.
            </Typography>
          ) : (
            <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }} aria-label="Evidence">
              {action.evidence.map((file) => (
                <li key={file.fileId}>
                  <Link component="button" type="button" onClick={() => { download.mutate(file.fileId); }}>
                    {file.fileName}
                  </Link>
                  {file.versionNo > 1 ? ` (version ${file.versionNo})` : ''}
                </li>
              ))}
            </Stack>
          )}
        </Box>

        <FileUpload label="Add evidence" value={chosen} onChange={setChosen} {...documentUpload} disabled={upload.isPending} />
        {chosen.length > 0 && (
          <Button
            variant="outlined"
            loading={upload.isPending}
            sx={{ alignSelf: 'flex-start' }}
            onClick={() => {
              const [file] = chosen;
              if (file) upload.mutate({ actionId: action.id, file }, { onSuccess: () => { setChosen([]); } });
            }}
          >
            Upload
          </Button>
        )}

        {tried && missingEvidence && <InlineAlert severity="error">Attach the evidence before closing the action.</InlineAlert>}

        <Form form={form} onSubmit={submit} id="close-action-form">
          <FormTextArea<CloseValues> name="remarks" label="What was done" minRows={2} rules={maxLength(LONG_TEXT, 'Remarks')} />
        </Form>
      </Stack>
    </Modal>
  );
}

/**
 * D5: the actions with their owner and target date. The team adds, changes and deletes them while at D5; each owner
 * adds evidence and closes their own; once all are closed the team completes the action plan, which opens D6.
 */
export function ActionsSection({ complaint, onMoved }: { complaint: ComplaintDetails; onMoved: () => void }) {
  const notify = useNotify();
  const failed = useActionFailure(complaintKeys.detail(complaint.publicId));
  const remove = useDeleteAction(complaint.publicId);
  const complete = useWorkflowAction(complaint.publicId);
  const download = useDownloadDocument();
  const [editing, setEditing] = useState<ActionDetails | 'new' | null>(null);
  const [deleting, setDeleting] = useState<ActionDetails | null>(null);
  const [closingId, setClosingId] = useState<number | null>(null);
  const [completing, setCompleting] = useState(false);
  const allowed = complaint.allowedActions;
  const canManage = allowed?.canManageActions === true;
  const closing = complaint.actions.find((action) => action.id === closingId && action.canClose);
  const today = businessToday();

  const columns: SimpleColumn<ActionDetails>[] = [
    { key: 'no', header: 'No', render: (row) => row.sortOrder, width: 56 },
    {
      key: 'description',
      header: 'Action',
      render: (row) => (
        <Stack spacing={0.5}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {row.description}
          </Typography>
          {row.status === 'Closed' && (
            <Typography variant="caption" color="text.secondary">
              Closed by {row.closedBy?.name ?? 'the owner'} on {formatDateTime(row.closedAt)}
              {row.closureRemarks ? `: ${row.closureRemarks}` : ''}
            </Typography>
          )}
        </Stack>
      ),
    },
    { key: 'owner', header: 'Responsible', render: (row) => row.owner.name, width: 160 },
    {
      key: 'targetDate',
      header: 'Target date',
      width: 130,
      render: (row) => (
        <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
          <span>{formatDate(row.targetDate)}</span>
          {row.status === 'Open' && row.targetDate < today && <StatusChip label="Overdue" tone="error" />}
        </Stack>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusChip {...actionStatusInfo[row.status]} />, width: 100 },
    {
      key: 'evidence',
      header: 'Evidence',
      width: 200,
      render: (row) =>
        row.evidence.length === 0 ? (
          '—'
        ) : (
          <Stack spacing={0.5}>
            {row.evidence.map((file) => (
              <Stack key={file.fileId} direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                <Tooltip title={`Download ${file.fileName}`}>
                  <IconButton size="small" aria-label={`Download ${file.fileName}`} onClick={() => { download.mutate(file.fileId); }}>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Typography variant="body2" noWrap>
                  {file.fileName}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: 140,
      render: (row) => (
        <Stack direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
          {row.canClose && (
            <Button size="small" variant="outlined" aria-label={`Close action ${row.sortOrder}`} onClick={() => { setClosingId(row.id); }}>
              Close
            </Button>
          )}
          {canManage && row.status === 'Open' && (
            <>
              <Tooltip title="Change">
                <IconButton aria-label={`Change action ${row.sortOrder}`} onClick={() => { setEditing(row); }}>
                  <EditOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton aria-label={`Delete action ${row.sortOrder}`} onClick={() => { setDeleting(row); }}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      ),
    },
  ];

  const open = complaint.actions.filter((action) => action.status === 'Open').length;

  return (
    <Stack spacing={2}>
      {canManage && !allowed?.canCompleteActionPlan && (
        <InlineAlert>
          {complaint.actions.length === 0
            ? 'Add the actions, each with its responsible person and target date. Each owner is emailed.'
            : `${open} of ${complaint.actions.length} actions still open. Each owner closes theirs with evidence; then complete the action plan.`}
        </InlineAlert>
      )}
      <SectionCard
        title="D5 Action plan"
        subheader="Corrective actions, their owners and target dates"
        flush
        actions={
          <>
            {canManage && (
              <Button startIcon={<AddIcon />} onClick={() => { setEditing('new'); }}>
                Add action
              </Button>
            )}
            {allowed?.canCompleteActionPlan && (
              <Button variant="contained" onClick={() => { setCompleting(true); }}>
                Complete action plan
              </Button>
            )}
          </>
        }
      >
        <SimpleTable<ActionDetails>
          aria-label="Actions"
          rows={[...complaint.actions].sort((a, b) => a.sortOrder - b.sortOrder)}
          columns={columns}
          getRowKey={(row) => row.id}
          emptyTitle="No actions"
          emptyMessage={canManage ? 'Add the corrective actions with Add action.' : undefined}
        />
      </SectionCard>

      {editing && (
        <ActionDialog
          publicId={complaint.publicId}
          action={editing === 'new' ? null : editing}
          onClose={() => {
            setEditing(null);
          }}
        />
      )}
      {closing && (
        <CloseActionDialog
          publicId={complaint.publicId}
          action={closing}
          onClose={() => {
            setClosingId(null);
          }}
        />
      )}
      <ConfirmDialog
        open={deleting !== null}
        title="Delete this action?"
        message="The action is removed and its owner's pending action closes."
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onClose={() => {
          setDeleting(null);
        }}
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(deleting.id, {
            onSuccess: () => {
              notify.success('Action deleted.');
              setDeleting(null);
            },
            onError: failed,
          });
        }}
      />
      <ConfirmDialog
        open={completing}
        title="Complete the action plan?"
        message="Every action is closed with evidence. D5 is complete and D6, the verification, opens."
        confirmLabel="Complete action plan"
        comment="optional"
        loading={complete.isPending}
        onClose={() => {
          setCompleting(false);
        }}
        onConfirm={(comment) => {
          complete.mutate(
            { step: 'completeActionPlan', input: { comment: comment || null, version: complaint.version } },
            {
              onSuccess: () => {
                setCompleting(false);
                onMoved();
              },
              onError: (error) => {
                failed(error);
                setCompleting(false);
              },
            },
          );
        }}
      />
    </Stack>
  );
}
