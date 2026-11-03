import type { ActionStatus, InternalActionDetails, InternalDetails } from '@cyient/api-client/cc';
import {
  applyServerErrors,
  Button,
  ConfirmDialog,
  Form,
  FormDatePicker,
  FormPeoplePicker,
  FormRadioGroup,
  FormTextArea,
  Modal,
  SectionCard,
  SimpleTable,
  StatusChip,
  useActionFailure,
  useNotify,
  type Option,
  type PersonOption,
  type SimpleColumn,
} from '@cyient/shared-ui';
import { formatDate, maxLength, required, textOrNull } from '@cyient/shared-utils';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { actionStatusInfo } from '../complaints/status';
import { internalKeys } from './keys';
import { useDeleteInternalAction, useSaveInternalAction } from './mutations';

interface InternalActionValues {
  description: string;
  owner: PersonOption | null;
  targetDate: string | null;
  status: ActionStatus;
  remarks: string;
}

const statuses: Option<ActionStatus>[] = [
  { value: 'Open', label: 'Open' },
  { value: 'Closed', label: 'Closed' },
];

const serverFieldNames = { ownerUserId: 'owner' } as const;

function InternalActionDialog({ publicId, action, onClose }: { publicId: string; action: InternalActionDetails | null; onClose: () => void }) {
  const notify = useNotify();
  const failed = useActionFailure(internalKeys.detail(publicId));
  const save = useSaveInternalAction(publicId);
  const form = useForm<InternalActionValues>({
    defaultValues: {
      description: action?.description ?? '',
      owner: action?.owner ? { id: action.owner.id, name: action.owner.name ?? '' } : null,
      targetDate: action?.targetDate ?? null,
      status: action?.status ?? 'Open',
      remarks: action?.remarks ?? '',
    },
  });

  const submit = (values: InternalActionValues) => {
    save.mutate(
      {
        actionId: action?.id ?? null,
        input: {
          description: values.description.trim(),
          ownerUserId: values.owner?.id ?? null,
          targetDate: values.targetDate,
          status: values.status,
          remarks: textOrNull(values.remarks),
          version: action?.version ?? null,
        },
      },
      {
        onSuccess: () => {
          notify.success(action ? 'Action changed.' : 'Action added.');
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
          <Button type="submit" form="internal-action-form" variant="contained" loading={save.isPending}>
            {action ? 'Save' : 'Add'}
          </Button>
        </>
      }
    >
      <Form form={form} onSubmit={submit} id="internal-action-form">
        <Stack spacing={2}>
          <FormTextArea<InternalActionValues>
            name="description"
            label="Action"
            rules={{
              required: 'The action is required.',
              validate: (value) => (typeof value === 'string' && value.trim() !== '') || 'The action is required.',
              ...maxLength(4000, 'The action'),
            }}
          />
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } }}>
            <FormPeoplePicker<InternalActionValues> name="owner" label="Responsible person" />
            <FormDatePicker<InternalActionValues> name="targetDate" label="Target date" />
          </Box>
          <FormRadioGroup<InternalActionValues, ActionStatus> name="status" label="Status" options={statuses} rules={required('Status')} />
          <FormTextArea<InternalActionValues> name="remarks" label="Remarks" minRows={2} rules={maxLength(4000, 'Remarks')} />
        </Stack>
      </Form>
    </Modal>
  );
}

/** The action matrix of an internal complaint: kept by the person who recorded it while it is open. */
export function InternalActionsSection({ complaint }: { complaint: InternalDetails }) {
  const notify = useNotify();
  const failed = useActionFailure(internalKeys.detail(complaint.publicId));
  const remove = useDeleteInternalAction(complaint.publicId);
  const [editing, setEditing] = useState<InternalActionDetails | 'new' | null>(null);
  const [deleting, setDeleting] = useState<InternalActionDetails | null>(null);
  const canEdit = complaint.canEdit === true;

  const columns: SimpleColumn<InternalActionDetails>[] = [
    { key: 'no', header: 'No', render: (row) => row.sortOrder, width: 56 },
    {
      key: 'description',
      header: 'Action',
      render: (row) => (
        <Stack spacing={0.5}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {row.description}
          </Typography>
          {row.remarks && (
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {row.remarks}
            </Typography>
          )}
        </Stack>
      ),
    },
    { key: 'owner', header: 'Responsible', render: (row) => row.owner?.name ?? '—', width: 160 },
    { key: 'targetDate', header: 'Target date', render: (row) => formatDate(row.targetDate) || '—', width: 120 },
    { key: 'status', header: 'Status', render: (row) => <StatusChip {...actionStatusInfo[row.status]} />, width: 100 },
    ...(canEdit
      ? [
          {
            key: 'actions',
            header: 'Actions',
            align: 'right' as const,
            width: 96,
            render: (row: InternalActionDetails) => (
              <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
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
              </Stack>
            ),
          },
        ]
      : []),
  ];

  return (
    <SectionCard
      title="Action matrix"
      flush
      actions={
        canEdit && (
          <Button startIcon={<AddIcon />} onClick={() => { setEditing('new'); }}>
            Add action
          </Button>
        )
      }
    >
      <SimpleTable<InternalActionDetails>
        aria-label="Action matrix"
        rows={[...complaint.actions].sort((a, b) => a.sortOrder - b.sortOrder)}
        columns={columns}
        getRowKey={(row) => row.id}
        emptyTitle="No actions"
        emptyMessage={canEdit ? 'Add the actions taken, with who is responsible and by when.' : undefined}
      />
      {editing && (
        <InternalActionDialog
          publicId={complaint.publicId}
          action={editing === 'new' ? null : editing}
          onClose={() => {
            setEditing(null);
          }}
        />
      )}
      <ConfirmDialog
        open={deleting !== null}
        title="Delete this action?"
        message={deleting?.description}
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
    </SectionCard>
  );
}
