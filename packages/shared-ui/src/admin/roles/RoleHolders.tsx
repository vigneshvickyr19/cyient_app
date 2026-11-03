import type { RoleDetails, RoleHolder } from '@cyient/api-client/platform';
import { notBlank, required } from '@cyient/shared-utils';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import { IconButton, Link, Button as MuiButton, Stack, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link as RouterLink } from 'react-router';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { SectionCard, StatusChip } from '../../components/display';
import { Modal } from '../../components/Modal';
import type { PersonOption } from '../../components/PeoplePicker';
import { SimpleTable, type SimpleColumn } from '../../components/SimpleTable';
import { FormInput, FormPeoplePicker, FormRadioGroup } from '../../form/fields';
import { applyServerErrors, Form } from '../../form/Form';
import { useNotify } from '../../notifications/NotificationProvider';
import { adminPermissions } from '../permissions';
import { useAdminPath } from '../shared/AdminBase';
import { useAddHolder, useRemoveHolder } from './queries';

interface RoleHoldersProps {
  role: RoleDetails;
  /** After a holder is added or taken away, with the role as it is now. */
  onChanged: (role: RoleDetails) => void;
}

const holderName = (holder: RoleHolder) => holder.user?.name ?? holder.adGroup ?? holder.loginName ?? `Holder ${holder.id}`;

/** Who holds a role: people and AD groups, with adding and taking away for those who manage users. */
export function RoleHolders({ role, onChanged }: RoleHoldersProps) {
  const { can } = useAuth();
  const adminPath = useAdminPath();
  const notify = useNotify();
  const canManage = can(adminPermissions.users);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<RoleHolder | null>(null);
  const remove = useRemoveHolder(role.id);

  const columns: SimpleColumn<RoleHolder>[] = [
    {
      key: 'holder',
      header: 'Holder',
      render: (holder) =>
        holder.user && canManage ? (
          <Link component={RouterLink} to={adminPath('users', holder.user.id)}>
            {holder.user.name}
          </Link>
        ) : (
          holderName(holder)
        ),
    },
    { key: 'type', header: 'Type', render: (holder) => <StatusChip label={holder.adGroup ? 'AD group' : 'Person'} tone={holder.adGroup ? 'info' : 'neutral'} /> },
    { key: 'login', header: 'Login', render: (holder) => holder.loginName ?? holder.adGroup ?? '' },
  ];
  if (canManage) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (holder) => (
        <Tooltip title="Take the role away">
          <IconButton
            aria-label={`Take the role away from ${holderName(holder)}`}
            onClick={() => {
              setRemoving(holder);
            }}
          >
            <PersonRemoveOutlinedIcon />
          </IconButton>
        </Tooltip>
      ),
    });
  }

  return (
    <>
      <SectionCard
        title="Holders"
        subheader="People who hold this role directly, and AD groups whose members hold it."
        flush
        actions={
          canManage && (
            <Button
              startIcon={<AddOutlinedIcon />}
              onClick={() => {
                setAdding(true);
              }}
            >
              Add holder
            </Button>
          )
        }
      >
        <SimpleTable
          aria-label="Role holders"
          rows={role.holders}
          columns={columns}
          getRowKey={(holder) => holder.id}
          emptyTitle="Nobody holds this role"
          emptyMessage={canManage ? 'Add a person or an AD group to give them this role.' : undefined}
        />
      </SectionCard>
      {adding && (
        <AddHolderDialog
          role={role}
          onClose={() => {
            setAdding(false);
          }}
          onAdded={(updated) => {
            setAdding(false);
            onChanged(updated);
          }}
        />
      )}
      <ConfirmDialog
        open={removing !== null}
        title="Take the role away?"
        message={removing ? `${holderName(removing)} will no longer hold the role "${role.name}".` : undefined}
        confirmLabel="Take away"
        danger
        loading={remove.isPending}
        onClose={() => {
          setRemoving(null);
        }}
        onConfirm={() => {
          if (!removing) return;
          remove.mutate(removing.id, {
            onSuccess: (result) => {
              notify.success(result.message ?? `${holderName(removing)} no longer holds this role.`);
              setRemoving(null);
              onChanged(result.data);
            },
            onError: (error) => {
              notify.error(error, 'The role could not be taken away.');
            },
          });
        }}
      />
    </>
  );
}

interface HolderForm {
  kind: 'person' | 'group';
  person: PersonOption | null;
  adGroup: string;
}

const AD_GROUP = /^[^\\\s]+\\[^\\]+$/;

/** Gives the role to a person (found in the directory) or an AD group, typed as DOMAIN\Group. */
function AddHolderDialog({ role, onClose, onAdded }: { role: RoleDetails; onClose: () => void; onAdded: (role: RoleDetails) => void }) {
  const form = useForm<HolderForm>({ defaultValues: { kind: 'person', person: null, adGroup: '' }, shouldUnregister: true });
  const kind = useWatch({ control: form.control, name: 'kind' });
  const add = useAddHolder(role.id);
  const notify = useNotify();
  const formId = 'add-holder-form';
  const holderIds = role.holders.flatMap((holder) => (holder.user ? [holder.user.id] : []));

  const submit = (values: HolderForm) => {
    const body = values.kind === 'person' ? { userId: values.person?.id ?? null } : { adGroup: values.adGroup.trim() };
    add.mutate(body, {
      onSuccess: (result) => {
        notify.success(result.message ?? 'The role has been given.');
        onAdded(result.data);
      },
      onError: (error) => {
        if (!applyServerErrors(error, form, { userId: 'person' })) notify.error(error, 'The role could not be given.');
      },
    });
  };

  return (
    <Modal
      open
      title={`Give "${role.name}"`}
      onClose={onClose}
      busy={add.isPending}
      actions={
        <>
          <MuiButton onClick={onClose} disabled={add.isPending}>
            Cancel
          </MuiButton>
          <Button type="submit" form={formId} variant="contained" loading={add.isPending}>
            Give role
          </Button>
        </>
      }
    >
      <Form form={form} onSubmit={submit} id={formId}>
        <Stack spacing={2}>
          <FormRadioGroup<HolderForm, HolderForm['kind']>
            name="kind"
            label="Give it to"
            options={[
              { value: 'person', label: 'A person' },
              { value: 'group', label: 'An AD group' },
            ]}
          />
          {kind === 'person' ? (
            <FormPeoplePicker<HolderForm> name="person" label="Person" rules={required('Person')} excludeIds={holderIds} />
          ) : (
            <FormInput<HolderForm, 'adGroup'>
              name="adGroup"
              label="AD group"
              placeholder="DOMAIN\Group"
              helperText="Everyone in the group gets the role, for example CYIENT\DLM-Reviewers."
              rules={{
                ...required('AD group'),
                validate: {
                  notBlank: notBlank('AD group'),
                  format: (value) => AD_GROUP.test(value.trim()) || 'Enter the group as DOMAIN\\Group.',
                },
              }}
            />
          )}
        </Stack>
      </Form>
    </Modal>
  );
}
