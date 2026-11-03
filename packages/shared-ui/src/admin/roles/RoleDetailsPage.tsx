import type { PermissionItem, RoleDetails } from '@cyient/api-client/platform';
import { maxLength, notBlank, required } from '@cyient/shared-utils';
import { Button as MuiButton, Stack } from '@mui/material';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { Button } from '../../components/Button';
import { InlineAlert, SectionCard, StatusChip } from '../../components/display';
import { ErrorState } from '../../components/ErrorState';
import { PageLoader } from '../../components/Loader';
import { PageHeader } from '../../components/PageHeader';
import { errorMessage } from '../../errors/errorMessage';
import { FormCheckbox, FormInput, FormTextArea } from '../../form/fields';
import { applyServerErrors, Form } from '../../form/Form';
import { useNotify } from '../../notifications/NotificationProvider';
import { useAdminPath } from '../shared/AdminBase';
import { ActiveChip } from '../shared/chips';
import { CONFLICT_MESSAGE, isConflict } from '../shared/feedback';
import { toInt } from '../shared/filters';
import { PermissionChecklist } from './PermissionChecklist';
import { usePermissions, useRole, useSaveRole } from './queries';
import { RoleHolders } from './RoleHolders';

/** One role: its name, description, state and permissions, and who holds it. */
export default function RoleDetailsPage() {
  const roleId = toInt(useParams().roleId);
  if (roleId === undefined) {
    return <ErrorState title="Role not found" message="The address doesn't name a role." />;
  }
  return <RoleLoader roleId={roleId} />;
}

function RoleLoader({ roleId }: { roleId: number }) {
  const role = useRole(roleId);
  const permissions = usePermissions();

  if (role.isError || permissions.isError) {
    return (
      <ErrorState
        title="We couldn't load the role"
        message={errorMessage(role.error ?? permissions.error)}
        onRetry={() => {
          void role.refetch();
          void permissions.refetch();
        }}
      />
    );
  }
  if (!role.data || !permissions.data) {
    return <PageLoader label="Loading the role…" />;
  }
  return <RoleEditor key={role.data.id} role={role.data} catalogue={permissions.data} reload={role.refetch} />;
}

interface RoleForm {
  name: string;
  description: string;
  isActive: boolean;
  permissions: string[];
}

const toForm = (role: RoleDetails): RoleForm => ({
  name: role.name,
  description: role.description ?? '',
  isActive: role.isActive,
  permissions: [...role.permissions],
});

interface RoleEditorProps {
  role: RoleDetails;
  catalogue: readonly PermissionItem[];
  reload: () => Promise<{ data?: RoleDetails }>;
}

function RoleEditor({ role, catalogue, reload }: RoleEditorProps) {
  const form = useForm<RoleForm>({ defaultValues: toForm(role) });
  // The version this form was loaded at, sent with the save so a change made by someone else in between is refused
  const [version, setVersion] = useState(role.version);
  const [saved, setSaved] = useState(role.permissions);
  const save = useSaveRole(role.id);
  const notify = useNotify();
  const adminPath = useAdminPath();
  const formId = 'role-form';

  const load = (fresh: RoleDetails) => {
    form.reset(toForm(fresh));
    setVersion(fresh.version);
    setSaved(fresh.permissions);
    save.reset();
  };

  const submit = (values: RoleForm) => {
    save.mutate(
      {
        name: role.isSystem ? role.name : values.name.trim(),
        description: values.description.trim() || null,
        isActive: role.isSystem ? true : values.isActive,
        permissions: values.permissions,
        version,
      },
      {
        onSuccess: (result) => {
          notify.success(result.message ?? 'The role has been saved.');
          load(result.data);
        },
        onError: (error) => {
          if (isConflict(error)) return;
          if (!applyServerErrors(error, form)) notify.error(error, 'The role could not be saved.');
        },
      },
    );
  };

  return (
    <>
      <PageHeader
        title={role.name}
        subtitle={role.description}
        backTo={adminPath('roles')}
        breadcrumbs={[{ label: 'Roles', to: adminPath('roles') }, { label: role.name }]}
        status={
          <>
            {role.isSystem && <StatusChip label="System" tone="info" />}
            <ActiveChip active={role.isActive} />
          </>
        }
        actions={
          <>
            <MuiButton
              disabled={!form.formState.isDirty || save.isPending}
              onClick={() => {
                form.reset();
              }}
            >
              Discard changes
            </MuiButton>
            <Button type="submit" form={formId} variant="contained" loading={save.isPending}>
              Save
            </Button>
          </>
        }
      />
      <Stack spacing={3}>
        {isConflict(save.error) && (
          <InlineAlert
            severity="warning"
            title="Not saved"
            action={
              <MuiButton
                color="inherit"
                onClick={() => {
                  void reload().then((result) => {
                    if (result.data) load(result.data);
                  });
                }}
              >
                Reload
              </MuiButton>
            }
          >
            {CONFLICT_MESSAGE}
          </InlineAlert>
        )}
        <Form form={form} onSubmit={submit} id={formId}>
          <Stack spacing={3}>
            <SectionCard title="Details">
              <Stack spacing={2}>
                <FormInput<RoleForm>
                  name="name"
                  label="Name"
                  disabled={role.isSystem}
                  helperText={role.isSystem ? 'System roles keep their name.' : undefined}
                  rules={role.isSystem ? undefined : { ...required('Name'), ...maxLength(100, 'Name'), validate: notBlank('Name') }}
                />
                <FormTextArea<RoleForm> name="description" label="Description" minRows={2} rules={maxLength(400, 'Description')} />
                <FormCheckbox<RoleForm>
                  name="isActive"
                  label="Active"
                  disabled={role.isSystem}
                  helperText={
                    role.isSystem ? 'System roles stay active.' : 'When a role is switched off, its holders lose its permissions.'
                  }
                />
              </Stack>
            </SectionCard>
            <SectionCard title="Permissions" subheader="Ticking a permission gives it to everyone who holds the role.">
              <Controller
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <PermissionChecklist catalogue={catalogue} value={field.value} saved={saved} onChange={field.onChange} disabled={save.isPending} />
                )}
              />
            </SectionCard>
          </Stack>
        </Form>
        <RoleHolders
          role={role}
          onChanged={(updated) => {
            setVersion(updated.version);
          }}
        />
      </Stack>
    </>
  );
}
