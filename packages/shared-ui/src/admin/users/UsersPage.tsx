import type { UserListItem } from '@cyient/api-client/platform';
import { formatDateTime, QUERY_PARAMS } from '@cyient/shared-utils';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { useAuth } from '../../index';
import { DataTable } from '../../index';
import { ErrorState } from '../../index';
import { Dropdown } from '../../index';
import { PageHeader } from '../../index';
import { FilterToolbar } from '../../index';
import { errorMessage } from '../../index';
import { useListState } from '../../index';
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
  const list = useListState<UserFilters>([QUERY_PARAMS.SEARCH, QUERY_PARAMS.STATUS, QUERY_PARAMS.ROLE_ID]);
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
      <FilterToolbar list={list} fields={['status', 'roleId']} searchName="search" searchPlaceholder="Name, login or email">
        {(filters, change) => (
          <>
            <Dropdown<string>
              label="Status"
              value={filters.status ?? null}
              options={statusOptions}
              emptyLabel="Any status"
              onChange={(status) => {
                change({ status: status ?? undefined });
              }}
            />
            {canSeeRoles && (
              <Dropdown<number>
                label="Role"
                value={toInt(filters.roleId) ?? null}
                options={(roles.data ?? []).map((role) => ({ value: role.id, label: role.name }))}
                emptyLabel="Any role"
                disabled={!roles.data}
                helperText={roles.isError ? 'The roles could not be loaded.' : undefined}
                onChange={(roleId) => {
                  change({ roleId: roleId === null ? undefined : String(roleId) });
                }}
              />
            )}
      
          </>
        )}
      </FilterToolbar>
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
          emptyTitle="No Data Found"
          emptyMessage="There are currently no records to display."
        />
      )}
    </>
  );
}
