import type { IssueList, IssueListItem } from '@cyient/api-client/mppl';
import { DataTable, ErrorState, errorMessage, FilterBar, PageHeader, SearchField, StatusChip, useListState } from '@cyient/shared-ui';
import { Tab, Tabs } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { issueColumns } from '../issues/columns';
import { statusInfo } from '../issues/status';
import { useAdminIssues } from './queries';

type AdminList = Exclude<IssueList, null>;

interface Filters {
  list?: string;
  search?: string;
}

const lists: readonly { value: AdminList; label: string }[] = [
  { value: 'Open', label: 'Open' },
  { value: 'Fixed', label: 'Fixed' },
  { value: 'Drafts', label: 'Drafts' },
  { value: 'All', label: 'Open and fixed' },
];

const columns: GridColDef<IssueListItem>[] = [
  { ...issueColumns.poNumber, sortable: false },
  issueColumns.poLineNumber,
  issueColumns.project,
  issueColumns.supplierName,
  issueColumns.raisedBy,
  issueColumns.sourcingLead,
  { field: 'status', headerName: 'Status', minWidth: 110, sortable: false, renderCell: ({ row }) => <StatusChip {...statusInfo[row.status]} /> },
  issueColumns.pendingWith,
  { ...issueColumns.submittedAt, sortable: false },
];

/** Every issue for request administrators: open one to close it for Sourcing or see its history, emails and audit trail. */
export function ManageIssuesPage() {
  const navigate = useNavigate();
  const list = useListState<Filters>(['list', 'search']);
  const current: AdminList = lists.find((item) => item.value === list.filters.list)?.value ?? 'Open';
  const issues = useAdminIssues({ List: current, Search: list.filters.search, Page: list.page, PageSize: list.pageSize });

  return (
    <>
      <PageHeader title="All issues (administration)" subtitle="Close an open issue for Sourcing, and see any issue's full history" />
      <Tabs
        value={current}
        onChange={(_, value: AdminList) => {
          list.setFilters({ list: value === 'Open' ? undefined : value });
        }}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 2 }}
      >
        {lists.map((item) => (
          <Tab key={item.value} value={item.value} label={item.label} />
        ))}
      </Tabs>
      <FilterBar active={Boolean(list.filters.search)} onClear={() => { list.setFilters({ search: undefined }); }}>
        <SearchField value={list.filters.search ?? ''} onSearch={(search) => { list.setFilters({ search }); }} placeholder="PO, part number, supplier, MPN…" />
      </FilterBar>
      {issues.isError ? (
        <ErrorState message={errorMessage(issues.error)} onRetry={() => void issues.refetch()} />
      ) : (
        <DataTable<IssueListItem>
          aria-label="All issues"
          rows={issues.data?.data ?? []}
          columns={columns}
          getRowId={(row) => row.publicId}
          loading={issues.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={issues.data?.meta}
          onPageChange={(page, pageSize) => { list.setPage(page, pageSize); }}
          onRowClick={(row) => void navigate(`/manage/issues/${row.publicId}`)}
          emptyTitle={list.filters.search ? 'No issues match this search' : 'No issues found'}
        />
      )}
    </>
  );
}
