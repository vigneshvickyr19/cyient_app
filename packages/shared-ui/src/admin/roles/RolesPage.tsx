import type { RoleSummary } from '@cyient/api-client/platform';
import { maxLength, notBlank, required } from '@cyient/shared-utils';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { Button as MuiButton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Button } from '../../index';
import { SectionCard, StatusChip } from '../../index';
import { ErrorState } from '../../index';
import { SectionSkeleton } from '../../index';
import { Modal } from '../../index';
import { PageHeader } from '../../index';
import { SimpleTable, type SimpleColumn } from '../../index';
import { errorMessage } from '../../index';
import { FormInput, FormTextArea } from '../../index';
import { applyServerErrors, Form } from '../../index';
import { useAdminPath } from '../shared/AdminBase';
import { ActiveChip } from '../shared/chips';
import { useCreateRole, useRoles } from './queries';

const columns: readonly SimpleColumn<RoleSummary>[] = [
  {
    key: 'name',
    header: 'Role',
    render: (role) => (
      <Stack spacing={0.5}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {role.name}
        </Typography>
        {role.description && (
          <Typography variant="caption" color="text.secondary">
            {role.description}
          </Typography>
        )}
      </Stack>
    ),
  },
  { key: 'type', header: 'Type', render: (role) => <StatusChip label={role.isSystem ? 'System' : 'Added'} tone={role.isSystem ? 'info' : 'neutral'} /> },
  { key: 'status', header: 'Status', render: (role) => <ActiveChip active={role.isActive} /> },
  { key: 'permissions', header: 'Permissions', align: 'right', render: (role) => role.permissionCount },
  { key: 'holders', header: 'Holders', align: 'right', render: (role) => role.holderCount },
];

/** Every role, with a way to add one; a role opens its details. */
export default function RolesPage() {
  const roles = useRoles();
  const navigate = useNavigate();
  const adminPath = useAdminPath();
  const [creating, setCreating] = useState(false);

  return (
    <>
      <PageHeader
        title="Roles"
        subtitle="What each role may do, and who holds it."
        actions={
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => {
              setCreating(true);
            }}
          >
            New role
          </Button>
        }
      />
      <SectionCard title="All roles" flush>
        {roles.isPending ? (
          <Stack sx={{ p: 2 }}>
            <SectionSkeleton />
          </Stack>
        ) : roles.isError ? (
          <ErrorState title="We couldn't load the roles" message={errorMessage(roles.error)} onRetry={() => void roles.refetch()} />
        ) : (
          <SimpleTable
            aria-label="Roles"
            rows={roles.data}
            columns={columns}
            getRowKey={(role) => role.id}
            onRowClick={(role) => {
              void navigate(adminPath('roles', role.id));
            }}
            emptyTitle="No roles yet"
            emptyMessage="Add a role to start giving people access."
          />
        )}
      </SectionCard>
      {creating && (
        <CreateRoleDialog
          onClose={() => {
            setCreating(false);
          }}
        />
      )}
    </>
  );
}

interface NewRoleForm {
  name: string;
  description: string;
}

/** Adds a role with its name and description; its permissions are chosen on the role's page. */
function CreateRoleDialog({ onClose }: { onClose: () => void }) {
  const form = useForm<NewRoleForm>({ defaultValues: { name: '', description: '' } });
  const create = useCreateRole();
  const navigate = useNavigate();
  const adminPath = useAdminPath();
  const formId = 'new-role-form';

  const submit = (values: NewRoleForm) => {
    create.mutate(
      { name: values.name.trim(), description: values.description.trim() || null, isActive: true, permissions: [] },
      {
        onSuccess: (result) => {
          void navigate(adminPath('roles', result.data.id));
        },
        onError: (error) => {
          applyServerErrors(error, form);
        },
      },
    );
  };

  return (
    <Modal
      open
      title="New role"
      onClose={onClose}
      busy={create.isPending}
      actions={
        <>
          <MuiButton onClick={onClose} disabled={create.isPending}>
            Cancel
          </MuiButton>
          <Button type="submit" form={formId} variant="contained" loading={create.isPending}>
            Add role
          </Button>
        </>
      }
    >
      <Form form={form} onSubmit={submit} id={formId}>
        <Stack spacing={2}>
          <FormInput<NewRoleForm>
            name="name"
            label="Name"
            autoFocus
            rules={{ ...required('Name'), ...maxLength(100, 'Name'), validate: notBlank('Name') }}
          />
          <FormTextArea<NewRoleForm> name="description" label="Description" minRows={2} rules={maxLength(400, 'Description')} />
        </Stack>
      </Form>
    </Modal>
  );
}
