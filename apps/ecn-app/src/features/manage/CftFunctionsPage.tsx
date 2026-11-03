import { isApiError } from '@cyient/api-client';
import type { CftActionTemplateDetails, CftFunctionDetails } from '@cyient/api-client/ecn';
import {
  applyServerErrors,
  Button,
  EmptyState,
  ErrorState,
  errorMessage,
  Form,
  FormCheckbox,
  FormInput,
  FormTextArea,
  Modal,
  PageHeader,
  PageLoader,
  SectionCard,
  SimpleTable,
  StatusChip,
  useNotify,
} from '@cyient/shared-ui';
import { notBlank, required, wholeNumber } from '@cyient/shared-utils';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useSaveCftActionTemplate, useSaveCftFunction } from '../masters/mutations';
import { useAdminCftFunctions } from '../masters/queries';

/** A dialog holding one form, with Cancel and Save. */
function FormDialog({ title, formId, saving, onClose, children }: { title: string; formId: string; saving: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      busy={saving}
      actions={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form={formId} variant="contained" loading={saving}>
            Save
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}

const textRules = (label: string, max: number) => ({
  ...required(label),
  validate: notBlank(label),
  maxLength: { value: max, message: `${label} is required, at most ${max} characters.` },
});

interface FunctionFormValues {
  code: string;
  name: string;
  sortOrder: string;
  isActive: boolean;
}

function FunctionDialog({ fn, nextOrder, onClose }: { fn: CftFunctionDetails | null; nextOrder: number; onClose: () => void }) {
  const notify = useNotify();
  const save = useSaveCftFunction();
  const form = useForm<FunctionFormValues>({
    defaultValues: { code: fn?.code ?? '', name: fn?.name ?? '', sortOrder: String(fn?.sortOrder ?? nextOrder), isActive: fn?.isActive ?? true },
  });

  const submit = (values: FunctionFormValues) => {
    save.mutate(
      {
        id: fn?.id ?? null,
        input: { code: values.code.trim(), name: values.name.trim(), sortOrder: Number(values.sortOrder), isActive: fn?.isInitiator === true || values.isActive, version: fn?.version ?? null },
      },
      {
        onSuccess: () => {
          notify.success(fn ? 'CFT function saved.' : 'CFT function added. It is on the CFT Team tab of every new note.');
          onClose();
        },
        onError: (error) => {
          if (applyServerErrors(error, form)) return;
          notify.error(error, 'The CFT function could not be saved.');
          if (isApiError(error) && error.isConflict) onClose();
        },
      },
    );
  };

  return (
    <FormDialog title={fn ? `Change ${fn.name}` : 'Add a CFT function'} formId="function-form" saving={save.isPending} onClose={onClose}>
      <Form form={form} onSubmit={submit} id="function-form">
        <Stack spacing={2}>
          <FormInput<FunctionFormValues> name="name" label="Name" autoFocus rules={textRules('Name', 100)} helperText="As shown on the CFT Team tab." />
          <FormInput<FunctionFormValues> name="code" label="Code" rules={textRules('Code', 50)} helperText="A short code, unique." />
          <FormInput<FunctionFormValues> name="sortOrder" label="Display order" type="number" rules={{ ...required('Display order'), validate: wholeNumber('Display order') }} />
          <FormCheckbox<FunctionFormValues>
            name="isActive"
            label="Active"
            disabled={fn?.isInitiator}
            helperText={fn?.isInitiator ? "The initiator's row is always on." : 'A switched-off function is no longer on new notes.'}
          />
        </Stack>
      </Form>
    </FormDialog>
  );
}

interface ActionFormValues {
  actionText: string;
  sortOrder: string;
  isActive: boolean;
}

function ActionDialog({ fn, action, onClose }: { fn: CftFunctionDetails; action: CftActionTemplateDetails | null; onClose: () => void }) {
  const notify = useNotify();
  const save = useSaveCftActionTemplate();
  const nextOrder = Math.max(0, ...fn.actions.map((a) => a.sortOrder)) + 1;
  const form = useForm<ActionFormValues>({
    defaultValues: { actionText: action?.actionText ?? '', sortOrder: String(action?.sortOrder ?? nextOrder), isActive: action?.isActive ?? true },
  });

  const submit = (values: ActionFormValues) => {
    save.mutate(
      {
        functionId: fn.id,
        actionId: action?.id ?? null,
        input: { actionText: values.actionText.trim(), sortOrder: Number(values.sortOrder), isActive: values.isActive, version: action?.version ?? null },
      },
      {
        onSuccess: () => {
          notify.success('Predefined action saved. Notes published to the CFT from now on get it.');
          onClose();
        },
        onError: (error) => {
          if (applyServerErrors(error, form)) return;
          notify.error(error, 'The action could not be saved.');
          if (isApiError(error) && error.isConflict) onClose();
        },
      },
    );
  };

  return (
    <FormDialog title={action ? `${fn.name}: change the action` : `${fn.name}: add an action`} formId="action-form" saving={save.isPending} onClose={onClose}>
      <Form form={form} onSubmit={submit} id="action-form">
        <Stack spacing={2}>
          <FormTextArea<ActionFormValues>
            name="actionText"
            label="Action"
            helperText="As the QMS template words it."
            rules={{ ...required('The action'), validate: notBlank('The action'), maxLength: { value: 500, message: 'The action is required, at most 500 characters.' } }}
          />
          <FormInput<ActionFormValues> name="sortOrder" label="Display order" type="number" rules={{ ...required('Display order'), validate: wholeNumber('Display order') }} />
          <FormCheckbox<ActionFormValues> name="isActive" label="Active" helperText="Notes already published keep their actions." />
        </Stack>
      </Form>
    </FormDialog>
  );
}

type Editing = { kind: 'function'; fn: CftFunctionDetails | null } | { kind: 'action'; fn: CftFunctionDetails; action: CftActionTemplateDetails | null } | null;

/** CFT functions and each one's predefined actions (from the QMS template): add, rename, reorder or switch off. */
export function CftFunctionsPage() {
  const functions = useAdminCftFunctions();
  const [editing, setEditing] = useState<Editing>(null);
  const close = () => { setEditing(null); };

  if (functions.isPending) return <PageLoader />;
  if (functions.isError) return <ErrorState message={errorMessage(functions.error)} onRetry={() => void functions.refetch()} />;

  const list = [...functions.data].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  const nextOrder = Math.max(0, ...list.map((f) => f.sortOrder)) + 1;

  return (
    <>
      <PageHeader
        title="CFT functions"
        subtitle="The functions on every note's CFT Team tab, and the predefined actions each gets when a note is published to the CFT"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing({ kind: 'function', fn: null }); }}>
            Add function
          </Button>
        }
      />
      {list.length === 0 ? (
        <EmptyState title="No CFT functions" message="Add the functions of the cross-functional team." />
      ) : (
        <Stack spacing={2}>
          {list.map((fn) => {
            const active = fn.actions.filter((a) => a.isActive).length;
            return (
              <SectionCard
                key={fn.id}
                title={
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>{fn.name}</span>
                    {fn.isInitiator && <StatusChip label="Initiator's row" tone="primary" />}
                    {!fn.isActive && <StatusChip label="Switched off" />}
                    {fn.isActive && active === 0 && <StatusChip label="No active actions" tone="warning" />}
                  </Stack>
                }
                subheader={`Code ${fn.code} · order ${fn.sortOrder} · ${active} active action${active === 1 ? '' : 's'}`}
                flush
                actions={
                  <>
                    <Button startIcon={<EditOutlinedIcon />} onClick={() => { setEditing({ kind: 'function', fn }); }}>
                      Change
                    </Button>
                    <Button startIcon={<AddIcon />} onClick={() => { setEditing({ kind: 'action', fn, action: null }); }}>
                      Add action
                    </Button>
                  </>
                }
              >
                <SimpleTable<CftActionTemplateDetails>
                  aria-label={`${fn.name} predefined actions`}
                  rows={[...fn.actions].sort((a, b) => a.sortOrder - b.sortOrder)}
                  getRowKey={(a) => a.id}
                  columns={[
                    { key: 'order', header: 'Order', width: 72, render: (a) => a.sortOrder },
                    { key: 'text', header: 'Action', render: (a) => <Box sx={{ whiteSpace: 'pre-wrap' }}>{a.actionText}</Box> },
                    {
                      key: 'status',
                      header: 'Status',
                      width: 130,
                      render: (a) => <StatusChip label={a.isActive ? 'Active' : 'Switched off'} tone={a.isActive ? 'success' : 'neutral'} />,
                    },
                    {
                      key: 'edit',
                      header: 'Change',
                      align: 'right',
                      width: 90,
                      render: (a) => (
                        <Tooltip title="Change">
                          <IconButton aria-label={`Change action ${a.sortOrder} of ${fn.name}`} onClick={() => { setEditing({ kind: 'action', fn, action: a }); }}>
                            <EditOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                      ),
                    },
                  ]}
                  emptyTitle="No predefined actions"
                  emptyMessage="Publishing to the CFT is refused while a named function has no active action."
                />
              </SectionCard>
            );
          })}
        </Stack>
      )}
      {editing?.kind === 'function' && <FunctionDialog fn={editing.fn} nextOrder={nextOrder} onClose={close} />}
      {editing?.kind === 'action' && <ActionDialog fn={editing.fn} action={editing.action} onClose={close} />}
    </>
  );
}
