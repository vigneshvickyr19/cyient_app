import type { UserListItem } from '@cyient/api-client/platform';
import { formatDateTime } from '@cyient/shared-utils';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { useAuth } from '../../auth/AuthProvider';
import { DataTable } from '../../components/DataTable';
import { ErrorState } from '../../components/ErrorState';
import { Dropdown } from '../../components/inputs';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar, SearchField } from '../../components/SearchFilter';
import { errorMessage } from '../../errors/errorMessage';
import { useListState } from '../../hooks/useListState';
import { adminPermissions } from '../permissions';
import { useRoles } from '../roles/queries';
import { useAdminPath } from '../shared/AdminBase';
import { ActiveChip } from '../shared/chips';
import { orUndefined, toInt } from '../shared/filters';
import { useUsers } from './queries';

type UserFilters = Partial<Record<'search' | 'status' | 'roleId', string>>;

const columns: readonly GridColDef<UserListItem>[] = [
  { field: 'displayName', headerName: 'Name', flex: 1.2, minWidth: 180, sortable: false },
  { field: 'loginName', headerName: 'Login', flex: 1, minWidth: 160, sortable: false },
  { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 200, sortable: false },
  { field: 'department', headerName: 'Department', flex: 1, minWidth: 140, sortable: false },
  { field: 'designation', headerName: 'Designation', flex: 1, minWidth: 140, sortable: false },
  {
    field: 'lastSignInAt',
    headerName: 'Last signed in',
    minWidth: 170,
    sortable: false,
    valueFormatter: (value: string | null) => formatDateTime(value) || 'Never',
  },
  { field: 'isActive', headerName: 'Status', minWidth: 130, sortable: false, renderCell: ({ row }) => <ActiveChip active={row.isActive} /> },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'off', label: 'Switched off' },
] as const;

/** People set up in this application, found by name, login or email and filtered by state and role. */
export default function UsersPage() {
  const list = useListState<UserFilters>(['search', 'status', 'roleId']);
  const { can } = useAuth();
  const canSeeRoles = can(adminPermissions.roles);
  const roles = useRoles(canSeeRoles);
  const navigate = useNavigate();
  const adminPath = useAdminPath();

  const users = useUsers({
    Page: list.page,
    PageSize: list.pageSize,
    Search: orUndefined(list.filters.search),
    IsActive: list.filters.status === 'active' ? true : list.filters.status === 'off' ? false : undefined,
    RoleId: toInt(list.filters.roleId),
  });

  return (
    <>
      <PageHeader title="Users" subtitle="People from Active Directory who are set up in this application." />
      <FilterBar active={list.filtered} onClear={list.clearFilters}>
        <SearchField
          label="Search"
          placeholder="Name, login or email"
          value={list.filters.search ?? ''}
          onSearch={(search) => {
            list.setFilters({ search });
          }}
        />
        <Dropdown<string>
          label="Status"
          value={list.filters.status ?? null}
          options={statusOptions}
          emptyLabel="Any status"
          onChange={(status) => {
            list.setFilters({ status: status ?? undefined });
          }}
        />
        {canSeeRoles && (
          <Dropdown<number>
            label="Role"
            value={toInt(list.filters.roleId) ?? null}
            options={(roles.data ?? []).map((role) => ({ value: role.id, label: role.name }))}
            emptyLabel="Any role"
            disabled={!roles.data}
            helperText={roles.isError ? 'The roles could not be loaded.' : undefined}
            onChange={(roleId) => {
              list.setFilters({ roleId: roleId === null ? undefined : String(roleId) });
            }}
          />
        )}
      </FilterBar>
      {users.isError ? (
        <ErrorState title="We couldn't load the users" message={errorMessage(users.error)} onRetry={() => void users.refetch()} />
      ) : (
        <DataTable
          aria-label="Users"
          rows={users.data?.data ?? []}
          columns={columns}
          getRowId={(user) => user.id}
          loading={users.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={users.data?.meta}
          onPageChange={list.setPage}
          onRowClick={(user) => {
            void navigate(adminPath('users', user.id));
          }}
          emptyTitle={list.filtered ? 'No users match' : 'No users yet'}
          emptyMessage={list.filtered ? 'Try other filters, or clear them.' : 'People appear here once they are synced from Active Directory.'}
        />
      )}
    </>
  );
}
