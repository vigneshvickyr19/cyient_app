import type { OpenTaskItem } from '@cyient/api-client/dn';
import { DataTable, ErrorState, errorMessage, FilterBar, Input, PageHeader, PeoplePicker, useAuth, useListState } from '@cyient/shared-ui';
import { daysSince, formatDateTime } from '@cyient/shared-utils';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { permissions } from '../../lib/permissions';
import { useOpenTasks } from './queries';

interface Filters {
  assignee?: string;
  assigneeName?: string;
  minDays?: string;
}

const columns: GridColDef<OpenTaskItem>[] = [
  { field: 'requestNo', headerName: 'Request no', minWidth: 120, sortable: false, valueGetter: (_, row) => row.requestNo ?? 'Draft' },
  { field: 'pendingRole', headerName: 'Step', minWidth: 150, sortable: false },
  { field: 'assignee', headerName: 'Pending with', flex: 1, minWidth: 160, sortable: false, valueGetter: (_, row) => row.assignee?.name },
  { field: 'initiator', headerName: 'Initiator', minWidth: 150, sortable: false, valueGetter: (_, row) => row.initiator.name },
  { field: 'assignedAt', headerName: 'Since', minWidth: 160, sortable: false, valueFormatter: (value: string) => formatDateTime(value) },
  { field: 'days', headerName: 'Days', minWidth: 80, sortable: false, valueGetter: (_, row) => daysSince(row.assignedAt) },
  { field: 'lastReminderAt', headerName: 'Last reminder', minWidth: 160, sortable: false, valueFormatter: (value: string | null) => formatDateTime(value) },
];

/** Open tasks: who each deviation waits for, longest waiting first. Request administrators open one to change its people. */
export function TasksPage() {
  const { can } = useAuth();
  const navigate = useNavigate();
  const list = useListState<Filters>(['assignee', 'assigneeName', 'minDays']);
  const assigneeId = list.filters.assignee ? Number(list.filters.assignee) : undefined;
  const tasks = useOpenTasks({
    AssigneeUserId: assigneeId,
    MinDaysWaiting: list.filters.minDays ? Number(list.filters.minDays) : undefined,
    Page: list.page,
    PageSize: list.pageSize,
  });
  const base = can(permissions.adminRequests) ? '/manage/requests' : '/requests';

  return (
    <>
      <PageHeader title="Open tasks" subtitle="Deviations waiting for someone, longest waiting first" />
      <FilterBar active={list.filtered} onClear={list.clearFilters}>
        <PeoplePicker
          label="Pending with"
          value={assigneeId ? { id: assigneeId, name: list.filters.assigneeName ?? '' } : null}
          onChange={(person) => { list.setFilters({ assignee: person?.id.toString(), assigneeName: person?.name }); }}
        />
        <Input
          label="Waiting at least (days)"
          type="number"
          value={list.filters.minDays ?? ''}
          onChange={(minDays) => { list.setFilters({ minDays }); }}
          slotProps={{ htmlInput: { min: 0 } }}
        />
      </FilterBar>
      {tasks.isError ? (
        <ErrorState message={errorMessage(tasks.error)} onRetry={() => void tasks.refetch()} />
      ) : (
        <DataTable<OpenTaskItem>
          aria-label="Open tasks"
          rows={tasks.data?.data ?? []}
          columns={columns}
          getRowId={(row) => row.taskId}
          loading={tasks.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={tasks.data?.meta}
          onPageChange={(page, pageSize) => { list.setPage(page, pageSize); }}
          onRowClick={(row) => void navigate(`${base}/${row.publicId}`)}
          emptyTitle={list.filtered ? 'No open tasks match these filters' : 'No open tasks'}
        />
      )}
    </>
  );
}
