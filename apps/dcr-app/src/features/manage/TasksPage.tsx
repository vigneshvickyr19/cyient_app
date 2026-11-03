import type { DcrStatus, OpenTaskItem } from '@cyient/api-client/dcr';
import {
  ConfirmDialog,
  DataTable,
  Dropdown,
  ErrorState,
  errorMessage,
  FilterBar,
  Input,
  PageHeader,
  PeoplePicker,
  StatusChip,
  useListState,
  useNotify,
  type PersonOption,
} from '@cyient/shared-ui';
import { daysSince, formatDate, formatDateTime } from '@cyient/shared-utils';
import { Button } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { isDcrStatus, statusInfo } from '../requests/status';
import { useOpenTasks, useReassignTask } from './queries';

/** The stages an administrator can reassign to another person; IMS and MR reviews are held by roles. */
const reassignable: DcrStatus[] = ['DeptManagerReview', 'DeptHeadReview'];
const stageOptions = (['ImsReview', 'DeptManagerReview', 'DeptHeadReview', 'MrReview'] as const).map((value) => ({ value, label: statusInfo[value].label }));

interface Filters {
  stage?: string;
  minDays?: string;
}

function ReassignDialog({ task, onClose }: { task: OpenTaskItem; onClose: () => void }) {
  const notify = useNotify();
  const reassign = useReassignTask();
  const [person, setPerson] = useState<PersonOption | null>(null);

  return (
    <ConfirmDialog
      open
      title={`Reassign ${statusInfo[task.stage].label}`}
      message={`${task.requestNo ?? 'Draft'} · ${task.documentReference}. Currently with ${task.assigneeUser?.name ?? task.assigneeRole?.name ?? 'nobody'}.`}
      confirmLabel="Reassign"
      comment="required"
      commentLabel="Reason"
      canConfirm={person !== null}
      loading={reassign.isPending}
      onClose={onClose}
      onConfirm={(reason) => {
        reassign.mutate(
          { taskId: task.taskId, input: { userId: person?.id ?? null, reason, version: task.version } },
          { onSuccess: onClose, onError: (error) => { notify.error(error); } },
        );
      }}
    >
      <PeoplePicker label="New reviewer" required value={person} onChange={setPerson} excludeIds={task.assigneeUser ? [task.assigneeUser.id, task.requestFrom.id] : [task.requestFrom.id]} />
    </ConfirmDialog>
  );
}

/** Open reviews, longest waiting first; Dept Manager and Dept Head reviews can be moved to someone else. */
export function TasksPage() {
  const list = useListState<Filters>(['stage', 'minDays']);
  const [reassigning, setReassigning] = useState<OpenTaskItem | null>(null);
  const tasks = useOpenTasks({
    Stage: isDcrStatus(list.filters.stage) ? list.filters.stage : undefined,
    MinDaysWaiting: list.filters.minDays ? Number(list.filters.minDays) : undefined,
    Page: list.page,
    PageSize: list.pageSize,
  });

  const columns: GridColDef<OpenTaskItem>[] = [
    { field: 'requestNo', headerName: 'Request no', minWidth: 130, sortable: false, valueGetter: (_, row) => row.requestNo ?? 'Draft' },
    { field: 'documentReference', headerName: 'Document reference', flex: 1, minWidth: 170, sortable: false },
    { field: 'stage', headerName: 'Stage', minWidth: 180, sortable: false, renderCell: ({ row }) => <StatusChip {...statusInfo[row.stage]} /> },
    { field: 'assignee', headerName: 'With', minWidth: 160, sortable: false, valueGetter: (_, row) => row.assigneeUser?.name ?? row.assigneeRole?.name },
    { field: 'assignedAt', headerName: 'Since', minWidth: 160, sortable: false, valueFormatter: (value: string) => formatDateTime(value) },
    { field: 'days', headerName: 'Days', minWidth: 80, sortable: false, valueGetter: (_, row) => daysSince(row.assignedAt) },
    { field: 'needByDate', headerName: 'Need by', minWidth: 110, sortable: false, valueFormatter: (value: string) => formatDate(value) },
    {
      field: 'actions',
      headerName: '',
      minWidth: 120,
      sortable: false,
      renderCell: ({ row }) =>
        reassignable.includes(row.stage) && row.assigneeUser ? (
          <Button size="small" onClick={() => { setReassigning(row); }}>
            Reassign
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader title="Open reviews" subtitle="Reviews waiting for someone, longest waiting first" />
      <FilterBar active={list.filtered} onClear={list.clearFilters}>
        <Dropdown label="Stage" options={stageOptions} value={isDcrStatus(list.filters.stage) ? list.filters.stage : null} emptyLabel="Any stage" onChange={(stage) => { list.setFilters({ stage: stage ?? undefined }); }} />
        <Input label="Waiting at least (days)" type="number" value={list.filters.minDays ?? ''} onChange={(minDays) => { list.setFilters({ minDays }); }} slotProps={{ htmlInput: { min: 0 } }} />
      </FilterBar>
      {tasks.isError ? (
        <ErrorState message={errorMessage(tasks.error)} onRetry={() => void tasks.refetch()} />
      ) : (
        <DataTable<OpenTaskItem>
          aria-label="Open reviews"
          rows={tasks.data?.data ?? []}
          columns={columns}
          getRowId={(row) => row.taskId}
          loading={tasks.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={tasks.data?.meta}
          onPageChange={(page, pageSize) => { list.setPage(page, pageSize); }}
          emptyTitle="No open reviews"
        />
      )}
      {reassigning && <ReassignDialog task={reassigning} onClose={() => { setReassigning(null); }} />}
    </>
  );
}
