import type { AuditAction, AuditEntry } from '@cyient/api-client/platform';
import { formatDateTime, humanize } from '@cyient/shared-utils';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import type { GridColDef } from '@mui/x-data-grid';
import { Button } from '../../components/Button';
import { DataTable } from '../../components/DataTable';
import { ErrorState } from '../../components/ErrorState';
import { Dropdown } from '../../components/inputs';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar, SearchField } from '../../components/SearchFilter';
import { errorMessage } from '../../errors/errorMessage';
import { useListState } from '../../hooks/useListState';
import { DateRangeFilter, orUndefined, toInt, UserFilter } from '../shared/filters';
import { useAudit, useAuditExport, type AuditQuery } from './queries';

type AuditFilters = Partial<Record<'table' | 'record' | 'userId' | 'userName' | 'action' | 'from' | 'to', string>>;

const actions = ['Insert', 'Update', 'Delete', 'Download', 'Export', 'Pdf'] as const satisfies readonly AuditAction[];

const isAction = (value: string | undefined): value is AuditAction => actions.some((action) => action === value);

const columns: readonly GridColDef<AuditEntry>[] = [
  { field: 'changedAt', headerName: 'When', minWidth: 170, sortable: false, valueFormatter: (value: string) => formatDateTime(value) },
  { field: 'user', headerName: 'User', flex: 1, minWidth: 150, sortable: false, valueGetter: (_value, row) => row.user?.name ?? 'System' },
  { field: 'action', headerName: 'Action', minWidth: 110, sortable: false, valueFormatter: (value: AuditAction) => humanize(value) },
  { field: 'tableName', headerName: 'Table', flex: 1, minWidth: 170, sortable: false },
  { field: 'recordId', headerName: 'Record', minWidth: 110, sortable: false },
  { field: 'fieldName', headerName: 'Field', flex: 1, minWidth: 130, sortable: false },
  { field: 'oldValue', headerName: 'Old value', flex: 1.2, minWidth: 160, sortable: false },
  { field: 'newValue', headerName: 'New value', flex: 1.2, minWidth: 160, sortable: false },
];

/** Recorded changes, newest first, with filters and an Excel export of the same filters. */
export default function AuditPage() {
  const list = useListState<AuditFilters>(['table', 'record', 'userId', 'userName', 'action', 'from', 'to']);
  const { filters } = list;
  const download = useAuditExport();

  const query: AuditQuery = {
    TableName: orUndefined(filters.table),
    RecordId: orUndefined(filters.record),
    UserId: toInt(filters.userId),
    Action: isAction(filters.action) ? filters.action : undefined,
    From: filters.from,
    To: filters.to,
  };
  const audit = useAudit({ ...query, Page: list.page, PageSize: list.pageSize });

  return (
    <>
      <PageHeader
        title="Audit trail"
        subtitle="Every recorded change, newest first: who changed what, and the old and new values."
        actions={
          <Button
            variant="outlined"
            startIcon={<FileDownloadOutlinedIcon />}
            loading={download.isPending}
            onClick={() => {
              download.mutate(query);
            }}
          >
            Export to Excel
          </Button>
        }
      />
      <FilterBar active={list.filtered} onClear={list.clearFilters}>
        <SearchField
          label="Table"
          placeholder="For example platform.Role"
          value={filters.table ?? ''}
          onSearch={(table) => {
            list.setFilters({ table });
          }}
        />
        <SearchField
          label="Record ID"
          value={filters.record ?? ''}
          onSearch={(record) => {
            list.setFilters({ record });
          }}
        />
        <UserFilter userId={filters.userId} userName={filters.userName} onChange={list.setFilters} />
        <Dropdown<AuditAction>
          label="Action"
          value={isAction(filters.action) ? filters.action : null}
          options={actions.map((action) => ({ value: action, label: humanize(action) }))}
          emptyLabel="Any action"
          onChange={(action) => {
            list.setFilters({ action: action ?? undefined });
          }}
        />
        <DateRangeFilter from={filters.from} to={filters.to} onChange={list.setFilters} />
      </FilterBar>
      {audit.isError ? (
        <ErrorState title="We couldn't load the audit trail" message={errorMessage(audit.error)} onRetry={() => void audit.refetch()} />
      ) : (
        <DataTable
          aria-label="Audit trail"
          rows={audit.data?.data ?? []}
          columns={columns}
          getRowId={(entry) => entry.id}
          loading={audit.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={audit.data?.meta}
          onPageChange={list.setPage}
          emptyTitle={list.filtered ? 'No changes match' : 'No changes recorded yet'}
          emptyMessage={list.filtered ? 'Try other filters, or clear them.' : undefined}
        />
      )}
    </>
  );
}
