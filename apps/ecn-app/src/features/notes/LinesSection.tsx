import type { ImmediateActionDetails, NoteDetails, PartDetails } from '@cyient/api-client/ecn';
import {
  applyServerErrors,
  Button,
  ConfirmDialog,
  Form,
  FormDatePicker,
  FormInput,
  FormTextArea,
  Modal,
  SectionCard,
  SimpleTable,
  useNotify,
  type SimpleColumn,
} from '@cyient/shared-ui';
import { formatDate, maxLength, required } from '@cyient/shared-utils';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useDeleteImmediateAction, useDeletePart, useSaveImmediateAction, useSavePart } from './mutations';

const text = (value: string | null) => (
  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
    {value ?? '—'}
  </Typography>
);

/** Change and Delete buttons of one row. */
function RowActions({ name, onEdit, onDelete }: { name: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
      <Tooltip title="Change">
        <IconButton aria-label={`Change ${name}`} onClick={onEdit}>
          <EditOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton aria-label={`Delete ${name}`} onClick={onDelete}>
          <DeleteOutlineIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

/** A row's form in a dialog, with Cancel and Save buttons. */
function LineDialog({ title, formId, saving, isNew, onClose, children }: { title: string; formId: string; saving: boolean; isNew: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      busy={saving}
      maxWidth="md"
      actions={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form={formId} variant="contained" loading={saving}>
            {isNew ? 'Add' : 'Save'}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}

interface PartFormValues {
  partNumber: string;
  materialDetails: string;
  remarks: string;
}

function PartDialog({ publicId, part, onClose }: { publicId: string; part: PartDetails | null; onClose: () => void }) {
  const notify = useNotify();
  const save = useSavePart(publicId);
  const form = useForm<PartFormValues>({
    defaultValues: { partNumber: part?.partNumber ?? '', materialDetails: part?.materialDetails ?? '', remarks: part?.remarks ?? '' },
  });

  const submit = (values: PartFormValues) => {
    save.mutate(
      {
        partId: part?.id ?? null,
        input: {
          partNumber: values.partNumber.trim(),
          materialDetails: values.materialDetails.trim() || null,
          remarks: values.remarks.trim() || null,
          version: part?.version ?? null,
        },
      },
      {
        onSuccess: () => {
          notify.success(part ? 'Part changed.' : 'Part added.');
          onClose();
        },
        onError: (error) => {
          if (!applyServerErrors(error, form)) notify.error(error);
        },
      },
    );
  };

  return (
    <LineDialog title={part ? `Part ${part.partNumber}` : 'Add a part'} formId="part-form" saving={save.isPending} isNew={!part} onClose={onClose}>
      <Form form={form} onSubmit={submit} id="part-form">
        <Stack spacing={2}>
          <FormInput<PartFormValues>
            name="partNumber"
            label="FG code / product part number"
            autoFocus
            rules={{ ...required('FG Code / Product Part Number'), ...maxLength(100, 'FG Code / Product Part Number') }}
          />
          <FormTextArea<PartFormValues> name="materialDetails" label="Material details" helperText="From the SAP ECN PDF." rules={maxLength(1000, 'Material details')} />
          <FormTextArea<PartFormValues> name="remarks" label="Remarks" rules={maxLength(1000, 'Remarks')} />
        </Stack>
      </Form>
    </LineDialog>
  );
}

/** The ECN Parts tab: the parts the change concerns, kept by the initiator until the note is published to the CFT. */
export function PartsSection({ note }: { note: NoteDetails }) {
  const notify = useNotify();
  const remove = useDeletePart(note.publicId);
  const [editing, setEditing] = useState<PartDetails | 'new' | null>(null);
  const [deleting, setDeleting] = useState<PartDetails | null>(null);
  const canEdit = note.allowedActions?.canEditLines === true;

  const columns: SimpleColumn<PartDetails>[] = [
    { key: 'partNumber', header: 'FG code / product part number', render: (row) => row.partNumber, width: 220 },
    { key: 'materialDetails', header: 'Material details', render: (row) => text(row.materialDetails) },
    { key: 'remarks', header: 'Remarks', render: (row) => text(row.remarks) },
    ...(canEdit
      ? [
          {
            key: 'actions',
            header: 'Actions',
            align: 'right' as const,
            width: 96,
            render: (row: PartDetails) => (
              <RowActions name={`part ${row.partNumber}`} onEdit={() => { setEditing(row); }} onDelete={() => { setDeleting(row); }} />
            ),
          },
        ]
      : []),
  ];

  return (
    <SectionCard
      title="ECN parts"
      subheader={canEdit ? 'Kept until the note is published to the CFT.' : undefined}
      flush
      actions={
        canEdit && (
          <Button startIcon={<AddIcon />} onClick={() => { setEditing('new'); }}>
            Add part
          </Button>
        )
      }
    >
      <SimpleTable<PartDetails>
        aria-label="ECN parts"
        rows={[...note.parts].sort((a, b) => a.sortOrder - b.sortOrder)}
        columns={columns}
        getRowKey={(row) => row.id}
        emptyTitle="No parts"
        emptyMessage={canEdit ? 'Add the FG codes or product part numbers the change concerns.' : undefined}
      />
      {editing && <PartDialog publicId={note.publicId} part={editing === 'new' ? null : editing} onClose={() => { setEditing(null); }} />}
      <ConfirmDialog
        open={deleting !== null}
        title={`Delete part ${deleting?.partNumber ?? ''}?`}
        message="The part is removed from this note."
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onClose={() => { setDeleting(null); }}
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(deleting.id, {
            onSuccess: () => {
              notify.success('Part deleted.');
              setDeleting(null);
            },
            onError: (error) => { notify.error(error); },
          });
        }}
      />
    </SectionCard>
  );
}

interface ImmediateActionFormValues {
  actionTaken: string;
  responsible: string;
  closedDate: string | null;
  remarks: string;
}

function ImmediateActionDialog({ publicId, action, onClose }: { publicId: string; action: ImmediateActionDetails | null; onClose: () => void }) {
  const notify = useNotify();
  const save = useSaveImmediateAction(publicId);
  const form = useForm<ImmediateActionFormValues>({
    defaultValues: {
      actionTaken: action?.actionTaken ?? '',
      responsible: action?.responsible ?? '',
      closedDate: action?.closedDate ?? null,
      remarks: action?.remarks ?? '',
    },
  });

  const submit = (values: ImmediateActionFormValues) => {
    save.mutate(
      {
        actionId: action?.id ?? null,
        input: {
          actionTaken: values.actionTaken.trim(),
          responsible: values.responsible.trim() || null,
          closedDate: values.closedDate,
          remarks: values.remarks.trim() || null,
          version: action?.version ?? null,
        },
      },
      {
        onSuccess: () => {
          notify.success(action ? 'Immediate action changed.' : 'Immediate action added.');
          onClose();
        },
        onError: (error) => {
          if (!applyServerErrors(error, form)) notify.error(error);
        },
      },
    );
  };

  return (
    <LineDialog
      title={action ? 'Change the immediate action' : 'Add an immediate action'}
      formId="immediate-action-form"
      saving={save.isPending}
      isNew={!action}
      onClose={onClose}
    >
      <Form form={form} onSubmit={submit} id="immediate-action-form">
        <Stack spacing={2}>
          <FormTextArea<ImmediateActionFormValues>
            name="actionTaken"
            label="Action taken"
            rules={{ required: 'The action is required.', ...maxLength(2000, 'The action') }}
          />
          <FormInput<ImmediateActionFormValues> name="responsible" label="Responsible" rules={maxLength(200, 'Responsible')} />
          <FormDatePicker<ImmediateActionFormValues> name="closedDate" label="Closed date" />
          <FormTextArea<ImmediateActionFormValues> name="remarks" label="Remarks" rules={maxLength(1000, 'Remarks')} />
        </Stack>
      </Form>
    </LineDialog>
  );
}

/** The Immediate Actions tab: actions closed on the spot at the CFT meeting, kept until the note is published to the CFT. */
export function ImmediateActionsSection({ note }: { note: NoteDetails }) {
  const notify = useNotify();
  const remove = useDeleteImmediateAction(note.publicId);
  const [editing, setEditing] = useState<ImmediateActionDetails | 'new' | null>(null);
  const [deleting, setDeleting] = useState<ImmediateActionDetails | null>(null);
  const canEdit = note.allowedActions?.canEditLines === true;
  const rows = [...note.immediateActions].sort((a, b) => a.sortOrder - b.sortOrder);

  const columns: SimpleColumn<ImmediateActionDetails>[] = [
    { key: 'no', header: 'No', render: (row) => rows.indexOf(row) + 1, width: 56 },
    { key: 'actionTaken', header: 'Action taken', render: (row) => text(row.actionTaken) },
    { key: 'responsible', header: 'Responsible', render: (row) => row.responsible ?? '—', width: 180 },
    { key: 'closedDate', header: 'Closed date', render: (row) => formatDate(row.closedDate) || '—', width: 130 },
    { key: 'remarks', header: 'Remarks', render: (row) => text(row.remarks) },
    ...(canEdit
      ? [
          {
            key: 'actions',
            header: 'Actions',
            align: 'right' as const,
            width: 96,
            render: (row: ImmediateActionDetails) => (
              <RowActions name={`immediate action ${rows.indexOf(row) + 1}`} onEdit={() => { setEditing(row); }} onDelete={() => { setDeleting(row); }} />
            ),
          },
        ]
      : []),
  ];

  return (
    <SectionCard
      title="Immediate actions"
      subheader="Actions closed on the spot at the CFT meeting"
      flush
      actions={
        canEdit && (
          <Button startIcon={<AddIcon />} onClick={() => { setEditing('new'); }}>
            Add immediate action
          </Button>
        )
      }
    >
      <SimpleTable<ImmediateActionDetails>
        aria-label="Immediate actions"
        rows={rows}
        columns={columns}
        getRowKey={(row) => row.id}
        emptyTitle="No immediate actions"
        emptyMessage={canEdit ? 'Record the actions closed at the CFT meeting.' : undefined}
      />
      {editing && <ImmediateActionDialog publicId={note.publicId} action={editing === 'new' ? null : editing} onClose={() => { setEditing(null); }} />}
      <ConfirmDialog
        open={deleting !== null}
        title="Delete this immediate action?"
        message="The action is removed from this note."
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onClose={() => { setDeleting(null); }}
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(deleting.id, {
            onSuccess: () => {
              notify.success('Immediate action deleted.');
              setDeleting(null);
            },
            onError: (error) => { notify.error(error); },
          });
        }}
      />
    </SectionCard>
  );
}
