import type { ClauseChangeType, ClauseDetails, RequestDetails } from '@cyient/api-client/dcr';
import {
  applyServerErrors,
  Button,
  ConfirmDialog,
  Form,
  FormInput,
  FormRadioGroup,
  FormTextArea,
  Modal,
  SectionCard,
  SimpleTable,
  useNotify,
  type Option,
  type SimpleColumn,
} from '@cyient/shared-ui';
import { maxLength, required } from '@cyient/shared-utils';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useDeleteClause, useSaveClause } from './mutations';

interface ClauseFormValues {
  clauseNo: string;
  changeType: ClauseChangeType | null;
  currentContent: string;
  amendedContent: string;
}

const changeTypes: Option<ClauseChangeType>[] = [
  { value: 'Addition', label: 'Addition' },
  { value: 'Amendment', label: 'Amendment' },
  { value: 'Deletion', label: 'Deletion' },
];

/** The API's clause rules: amended content for an addition or amendment, current content for an amendment or deletion. */
const needsCurrent = (type: ClauseChangeType | null) => type === 'Amendment' || type === 'Deletion';
const needsAmended = (type: ClauseChangeType | null) => type === 'Addition' || type === 'Amendment';

function ClauseDialog({ publicId, clause, onClose }: { publicId: string; clause: ClauseDetails | null; onClose: () => void }) {
  const notify = useNotify();
  const save = useSaveClause(publicId);
  const form = useForm<ClauseFormValues>({
    defaultValues: {
      clauseNo: clause?.clauseNo ?? '',
      changeType: clause?.changeType ?? null,
      currentContent: clause?.currentContent ?? '',
      amendedContent: clause?.amendedContent ?? '',
    },
  });
  const changeType = useWatch({ control: form.control, name: 'changeType' });

  const submit = (values: ClauseFormValues) => {
    save.mutate(
      {
        clauseId: clause?.id ?? null,
        input: {
          clauseNo: values.clauseNo.trim(),
          changeType: values.changeType,
          currentContent: needsCurrent(values.changeType) ? values.currentContent.trim() : null,
          amendedContent: needsAmended(values.changeType) ? values.amendedContent.trim() : null,
          version: clause?.version ?? null,
        },
      },
      {
        onSuccess: () => {
          notify.success(clause ? 'Clause line changed.' : 'Clause line added.');
          onClose();
        },
        onError: (error) => {
          if (!applyServerErrors(error, form)) notify.error(error);
        },
      },
    );
  };

  return (
    <Modal
      open
      title={clause ? `Clause ${clause.clauseNo}` : 'Add a clause line'}
      onClose={onClose}
      busy={save.isPending}
      maxWidth="md"
      actions={
        <>
          <Button onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="clause-form" variant="contained" loading={save.isPending}>
            {clause ? 'Save' : 'Add'}
          </Button>
        </>
      }
    >
      <Form form={form} onSubmit={submit} id="clause-form">
        <Stack spacing={2}>
          <FormInput<ClauseFormValues>
            name="clauseNo"
            label="Document clause no"
            autoFocus
            rules={{ ...required('Document Clause No'), ...maxLength(50, 'Document Clause No') }}
          />
          <FormRadioGroup<ClauseFormValues, ClauseChangeType>
            name="changeType"
            label="Change"
            options={changeTypes}
            rules={{ required: 'Addition, Amendment or Deletion is required.' }}
          />
          {needsCurrent(changeType) && (
            <FormTextArea<ClauseFormValues>
              name="currentContent"
              label="Current content"
              rules={{ required: 'Current Content is required for an amendment or deletion.' }}
            />
          )}
          {needsAmended(changeType) && (
            <FormTextArea<ClauseFormValues>
              name="amendedContent"
              label="Amended content"
              rules={{ required: 'Amended Content is required for an addition or amendment.' }}
            />
          )}
        </Stack>
      </Form>
    </Modal>
  );
}

/** The Document Details tab: the clause lines that change, editable while the request is a draft. */
export function ClausesSection({ request }: { request: RequestDetails }) {
  const notify = useNotify();
  const remove = useDeleteClause(request.publicId);
  const [editing, setEditing] = useState<ClauseDetails | 'new' | null>(null);
  const [deleting, setDeleting] = useState<ClauseDetails | null>(null);
  const canEdit = request.allowedActions?.canEdit === true;

  const text = (value: string | null) => (
    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
      {value ?? '—'}
    </Typography>
  );

  const columns: SimpleColumn<ClauseDetails>[] = [
    { key: 'clauseNo', header: 'Clause no', render: (row) => row.clauseNo, width: 120 },
    { key: 'changeType', header: 'Change', render: (row) => row.changeType, width: 120 },
    { key: 'current', header: 'Current content', render: (row) => text(row.currentContent) },
    { key: 'amended', header: 'Amended content', render: (row) => text(row.amendedContent) },
    ...(canEdit
      ? [
          {
            key: 'actions',
            header: 'Actions',
            align: 'right' as const,
            width: 96,
            render: (row: ClauseDetails) => (
              <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                <Tooltip title="Change">
                  <IconButton aria-label={`Change clause ${row.clauseNo}`} onClick={() => { setEditing(row); }}>
                    <EditOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton aria-label={`Delete clause ${row.clauseNo}`} onClick={() => { setDeleting(row); }}>
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
      title="Document details"
      subheader="The clauses this request changes"
      flush
      actions={
        canEdit && (
          <Button startIcon={<AddIcon />} onClick={() => { setEditing('new'); }}>
            Add clause line
          </Button>
        )
      }
    >
      <SimpleTable<ClauseDetails>
        aria-label="Clause lines"
        rows={[...request.clauses].sort((a, b) => a.sortOrder - b.sortOrder)}
        columns={columns}
        getRowKey={(row) => row.id}
        emptyTitle="No clause lines"
        emptyMessage={canEdit ? 'Add the clauses this request changes.' : undefined}
      />
      {editing && (
        <ClauseDialog
          publicId={request.publicId}
          clause={editing === 'new' ? null : editing}
          onClose={() => {
            setEditing(null);
          }}
        />
      )}
      <ConfirmDialog
        open={deleting !== null}
        title={`Delete clause ${deleting?.clauseNo ?? ''}?`}
        message="The clause line is removed from this request."
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
              notify.success('Clause line deleted.');
              setDeleting(null);
            },
            onError: (error) => {
              notify.error(error);
            },
          });
        }}
      />
    </SectionCard>
  );
}
