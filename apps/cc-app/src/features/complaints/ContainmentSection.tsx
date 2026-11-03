import type { ActionStatus, ComplaintDetails, ContainmentDetails } from '@cyient/api-client/cc';
import {
  applyServerErrors,
  Button,
  ConfirmDialog,
  Form,
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
import { maxLength, required } from '@cyient/shared-utils';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { complaintKeys } from './keys';
import { useDeleteContainment, useSaveContainment } from './mutations';
import { actionStatusInfo } from './status';

interface ContainmentFormValues {
  description: string;
  responsible: PersonOption | null;
  status: ActionStatus;
}

const statuses: Option<ActionStatus>[] = [
  { value: 'Closed', label: 'Done' },
  { value: 'Open', label: 'Still open' },
];

const serverFieldNames = { responsibleUserId: 'responsible' } as const;

function ContainmentDialog({ publicId, line, onClose }: { publicId: string; line: ContainmentDetails | null; onClose: () => void }) {
  const notify = useNotify();
  const failed = useActionFailure(complaintKeys.detail(publicId));
  const save = useSaveContainment(publicId);
  const form = useForm<ContainmentFormValues>({
    defaultValues: {
      description: line?.description ?? '',
      responsible: line ? { id: line.responsible.id, name: line.responsible.name ?? '' } : null,
      status: line?.status ?? 'Closed',
    },
  });

  const submit = (values: ContainmentFormValues) => {
    save.mutate(
      {
        lineId: line?.id ?? null,
        input: { description: values.description.trim(), responsibleUserId: values.responsible?.id ?? null, status: values.status, version: line?.version ?? null },
      },
      {
        onSuccess: () => {
          notify.success(line ? 'Containment action changed.' : 'Containment action added.');
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
      title={line ? 'Change the containment action' : 'Add a containment action'}
      onClose={onClose}
      busy={save.isPending}
      maxWidth="md"
      actions={
        <>
          <Button onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="containment-form" variant="contained" loading={save.isPending}>
            {line ? 'Save' : 'Add'}
          </Button>
        </>
      }
    >
      <Form form={form} onSubmit={submit} id="containment-form">
        <Stack spacing={2}>
          <FormTextArea<ContainmentFormValues>
            name="description"
            label="Containment action"
            rules={{ required: 'The containment action is required.', ...maxLength(4000, 'The containment action') }}
          />
          <FormPeoplePicker<ContainmentFormValues> name="responsible" label="Responsible person" rules={{ required: 'The responsible person is required.' }} />
          <FormRadioGroup<ContainmentFormValues, ActionStatus> name="status" label="Status" options={statuses} rules={required('Status')} />
        </Stack>
      </Form>
    </Modal>
  );
}

/** D3: the containment actions taken straight away, with the person responsible; kept by the initiator, no email. */
export function ContainmentSection({ complaint }: { complaint: ComplaintDetails }) {
  const notify = useNotify();
  const failed = useActionFailure(complaintKeys.detail(complaint.publicId));
  const remove = useDeleteContainment(complaint.publicId);
  const [editing, setEditing] = useState<ContainmentDetails | 'new' | null>(null);
  const [deleting, setDeleting] = useState<ContainmentDetails | null>(null);
  const canEdit = complaint.allowedActions?.canEdit === true;

  const columns: SimpleColumn<ContainmentDetails>[] = [
    { key: 'no', header: 'No', render: (row) => row.sortOrder, width: 56 },
    {
      key: 'description',
      header: 'Containment action',
      render: (row) => (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          {row.description}
        </Typography>
      ),
    },
    { key: 'responsible', header: 'Responsible', render: (row) => row.responsible.name, width: 180 },
    { key: 'status', header: 'Status', render: (row) => <StatusChip {...actionStatusInfo[row.status]} />, width: 110 },
    ...(canEdit
      ? [
          {
            key: 'actions',
            header: 'Actions',
            align: 'right' as const,
            width: 96,
            render: (row: ContainmentDetails) => (
              <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                <Tooltip title="Change">
                  <IconButton aria-label={`Change containment action ${row.sortOrder}`} onClick={() => { setEditing(row); }}>
                    <EditOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton aria-label={`Delete containment action ${row.sortOrder}`} onClick={() => { setDeleting(row); }}>
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
      title="D3 Containment actions"
      subheader="What was done straight away to protect the customer"
      flush
      actions={
        canEdit && (
          <Button startIcon={<AddIcon />} onClick={() => { setEditing('new'); }}>
            Add containment action
          </Button>
        )
      }
    >
      <SimpleTable<ContainmentDetails>
        aria-label="Containment actions"
        rows={[...complaint.containmentActions].sort((a, b) => a.sortOrder - b.sortOrder)}
        columns={columns}
        getRowKey={(row) => row.id}
        emptyTitle="No containment actions"
        emptyMessage={canEdit ? 'Add what was done straight away, and who did it.' : undefined}
      />
      {editing && (
        <ContainmentDialog
          publicId={complaint.publicId}
          line={editing === 'new' ? null : editing}
          onClose={() => {
            setEditing(null);
          }}
        />
      )}
      <ConfirmDialog
        open={deleting !== null}
        title="Delete this containment action?"
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
              notify.success('Containment action deleted.');
              setDeleting(null);
            },
            onError: failed,
          });
        }}
      />
    </SectionCard>
  );
}
