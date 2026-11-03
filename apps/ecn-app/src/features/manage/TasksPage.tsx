import type { NoteStatus, OpenTaskItem } from '@cyient/api-client/ecn';
import { DataTable, Dropdown, ErrorState, errorMessage, FilterBar, Input, PageHeader, StatusChip, useAuth, useListState, type Option } from '@cyient/shared-ui';
import { daysSince, formatDate, formatDateTime } from '@cyient/shared-utils';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { manageNotePermissions } from '../../lib/permissions';
import { isNoteStatus, stageLabel, statusInfo } from '../notes/status';
import { useOpenTasks } from './queries';

/** The stages that have tasks, and who holds each. */
const stageOptions: Option<NoteStatus>[] = [
  { value: 'CftReview', label: 'CFT Review (CFT members)' },
  { value: 'CftClosed', label: 'CFT Actions Closed (initiator)' },
  { value: 'ReviewerReview', label: 'Reviewer Review' },
  { value: 'ApproverReview', label: 'Approver Review' },
  { value: 'Approved', label: 'Approved (release by ECN admins)' },
];

interface Filters {
  stage?: string;
  minDays?: string;
}

const columns: GridColDef<OpenTaskItem>[] = [
  { field: 'noteNo', headerName: 'Number', minWidth: 140, sortable: false },
  {
    field: 'stage',
    headerName: 'Stage',
    minWidth: 180,
    sortable: false,
    renderCell: ({ row }) => (isNoteStatus(row.stage) ? <StatusChip {...statusInfo[row.stage]} /> : <StatusChip label={stageLabel(row.stage)} />),
  },
  { field: 'assignee', headerName: 'With', minWidth: 170, flex: 1, sortable: false, valueGetter: (_, row) => row.assigneeUser?.name ?? row.assigneeRole?.name },
  { field: 'initiator', headerName: 'Initiator', minWidth: 160, sortable: false, valueGetter: (_, row) => row.initiator.name },
  { field: 'assignedAt', headerName: 'Since', minWidth: 160, sortable: false, valueFormatter: (value: string) => formatDateTime(value) },
  { field: 'days', headerName: 'Days', minWidth: 80, sortable: false, valueGetter: (_, row) => daysSince(row.assignedAt) },
  { field: 'targetDate', headerName: 'Target date', minWidth: 120, sortable: false, valueFormatter: (value: string | null) => formatDate(value) },
  { field: 'lastReminderAt', headerName: 'Last reminder', minWidth: 160, sortable: false, valueFormatter: (value: string | null) => formatDateTime(value) },
];

/** Open tasks of every note, longest waiting first; a row opens the note's administration page. */
export function TasksPage() {
  const navigate = useNavigate();
  const { canAny } = useAuth();
  const noteAddress = (publicId: string) => (canAny(...manageNotePermissions) ? `/manage/notes/${publicId}` : `/notes/${publicId}`);
  const list = useListState<Filters>(['stage', 'minDays']);
  const tasks = useOpenTasks({
    Stage: isNoteStatus(list.filters.stage) ? list.filters.stage : undefined,
    MinDaysWaiting: list.filters.minDays ? Number(list.filters.minDays) : undefined,
    Page: list.page,
    PageSize: list.pageSize,
  });

  return (
    <>
      <PageHeader title="Open tasks" subtitle="CFT actions, reviews, approvals and releases waiting for someone, longest waiting first" />
      <FilterBar active={list.filtered} onClear={list.clearFilters}>
        <Dropdown
          label="Stage"
          options={stageOptions}
          value={isNoteStatus(list.filters.stage) ? list.filters.stage : null}
          emptyLabel="Any stage"
          onChange={(stage) => { list.setFilters({ stage: stage ?? undefined }); }}
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
          onRowClick={(row) => void navigate(noteAddress(row.publicId))}
          emptyTitle={list.filtered ? 'No open tasks match these filters' : 'No open tasks'}
        />
      )}
    </>
  );
}
