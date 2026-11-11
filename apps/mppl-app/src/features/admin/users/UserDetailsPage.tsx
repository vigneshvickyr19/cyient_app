import type { UserDetails, UserRoleItem } from '@cyient/api-client/platform';
import { formatDateTime } from '@cyient/shared-utils';
import { Link, Stack } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router';
import { useAuth } from '@cyient/shared-ui';
import { Button } from '@cyient/shared-ui';
import { ConfirmDialog } from '@cyient/shared-ui';
import { DetailList, InlineAlert, SectionCard } from '@cyient/shared-ui';
import { ErrorState } from '@cyient/shared-ui';
import { PageLoader } from '@cyient/shared-ui';
import { PageHeader } from '@cyient/shared-ui';
import { SimpleTable, type SimpleColumn } from '@cyient/shared-ui';
import { errorMessage } from '@cyient/shared-ui';
import { useNotify } from '@cyient/shared-ui';
import { adminPermissions } from '../permissions';
import { useAdminPath } from '../shared/AdminBase';
import { ActiveChip } from '../shared/chips';
import { useChangeFailed } from '../shared/feedback';
import { toInt } from '../shared/filters';
import { useSetUserStatus, useUser } from './queries';

/** One person: their details from Active Directory, the roles they hold, and switching them off or on. */
export default function UserDetailsPage() {
  const userId = toInt(useParams().userId);
  if (userId === undefined) {
    return <ErrorState title="User not found" message="The address doesn't name a user." />;
  }
  return <UserLoader userId={userId} />;
}

function UserLoader({ userId }: { userId: number }) {
  const user = useUser(userId);
  if (user.isError) {
    return <ErrorState title="We couldn't load the user" message={errorMessage(user.error)} onRetry={() => void user.refetch()} />;
  }
  if (!user.data) {
    return <PageLoader label="Loading the user…" />;
  }
  return <UserView user={user.data} />;
}

function UserView({ user }: { user: UserDetails }) {
  const auth = useAuth();
  const adminPath = useAdminPath();
  const notify = useNotify();
  const changeFailed = useChangeFailed();
  const setStatus = useSetUserStatus(user.id);
  const [confirming, setConfirming] = useState(false);
  const own = user.id === auth.user.userId;
  const canOpenRoles = auth.can(adminPermissions.roles);

  const roleColumns: readonly SimpleColumn<UserRoleItem>[] = [
    {
      key: 'role',
      header: 'Role',
      render: (item) =>
        canOpenRoles ? (
          <Link component={RouterLink} to={adminPath('roles', item.roleId)}>
            {item.roleName}
          </Link>
        ) : (
          item.roleName
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title={user.displayName}
        subtitle={user.loginName}
        backTo={adminPath('users')}
        breadcrumbs={[{ label: 'Users', to: adminPath('users') }, { label: user.displayName }]}
        status={<ActiveChip active={user.isActive} />}
        actions={
          !own && (
            <Button
              variant={user.isActive ? 'outlined' : 'contained'}
              color={user.isActive ? 'error' : 'primary'}
              onClick={() => {
                setConfirming(true);
              }}
            >
              {user.isActive ? 'Switch off' : 'Switch on'}
            </Button>
          )
        }
      />
      <Stack spacing={3}>
        {own && <InlineAlert severity="info">This is your own account. You can&apos;t switch yourself off.</InlineAlert>}
        <SectionCard title="Details" subheader="Names, emails and managers come from Active Directory and can't be changed here.">
          <DetailList
            items={[
              { label: 'Name', value: user.displayName },
              { label: 'Login', value: user.loginName },
              { label: 'Email', value: user.email },
              { label: 'Department', value: user.department },
              { label: 'Designation', value: user.designation },
              {
                label: 'Manager',
                value: user.manager && (
                  <Link component={RouterLink} to={adminPath('users', user.manager.id)}>
                    {user.manager.name}
                  </Link>
                ),
              },
              { label: 'Last signed in', value: formatDateTime(user.lastSignInAt) || 'Never' },
              { label: 'Last updated from Active Directory', value: formatDateTime(user.lastSyncedAt) },
            ]}
          />
        </SectionCard>
        <SectionCard title="Roles held" subheader="Roles given to this person directly. Roles held through AD groups are not listed." flush>
          <SimpleTable
            aria-label="Roles held"
            rows={user.roles}
            columns={roleColumns}
            getRowKey={(item) => item.holderId}
            emptyTitle="No roles held directly"
            emptyMessage="Give a role from the role's page."
          />
        </SectionCard>
      </Stack>
      <ConfirmDialog
        open={confirming}
        title={user.isActive ? `Switch off ${user.displayName}?` : `Switch on ${user.displayName}?`}
        message={
          user.isActive
            ? 'They will no longer be able to use this application. Their requests and history stay as they are.'
            : 'They will be able to use this application again, with the roles they hold.'
        }
        confirmLabel={user.isActive ? 'Switch off' : 'Switch on'}
        danger={user.isActive}
        loading={setStatus.isPending}
        onClose={() => {
          setConfirming(false);
        }}
        onConfirm={() => {
          setStatus.mutate(
            { isActive: !user.isActive, version: user.version },
            {
              onSuccess: (result) => {
                notify.success(result.message ?? (result.data.isActive ? 'The user has been switched on.' : 'The user has been switched off.'));
                setConfirming(false);
              },
              onError: (error) => {
                setConfirming(false);
                changeFailed(error, 'The user could not be changed.');
              },
            },
          );
        }}
      />
    </>
  );
}
