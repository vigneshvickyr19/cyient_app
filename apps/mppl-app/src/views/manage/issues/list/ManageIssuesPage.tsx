import type { IssueListItem } from '@cyient/api-client/mppl';
import { DataTable, errorMessage, ErrorState, FilterToolbar, PageHeader, SegmentedTabs, StatusChip, Tab, useListState } from '@cyient/shared-ui';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { issueColumns } from '@/components/issues/columns';
import { STATUS_ACTIONS, statusInfo } from '@/constants/issue-status';
import { MANAGE_ISSUE_LIST_OPTIONS, type AdminList } from '@/constants/static-dropdowns';
import { QUERY_PARAMS } from '@/constants/query-params';
import { useAdminIssues } from '@/hooks/manage/queries';

interface Filters {
  list?: string;
  search?: string;
}

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
  const list = useListState<Filters>([QUERY_PARAMS.LIST, QUERY_PARAMS.SEARCH]);
  const current: AdminList = MANAGE_ISSUE_LIST_OPTIONS.find((item) => item.value === list.filters.list)?.value ?? STATUS_ACTIONS.OPEN;
  const issues = useAdminIssues({ List: current, Search: list.filters.search, Page: list.page, PageSize: list.pageSize });

  return (
    <>
      <PageHeader title="All issues (administration)" subtitle="Close an open issue for Sourcing, and see any issue's full history" />
      <SegmentedTabs
        value={current}
        onChange={(_, value: AdminList) => {
          list.setFilters({ list: value === STATUS_ACTIONS.OPEN ? undefined : value });
        }}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 2 }}
      >
        {MANAGE_ISSUE_LIST_OPTIONS.map((item) => (
          <Tab key={item.value} value={item.value} label={item.label} />
        ))}
      </SegmentedTabs>
      <FilterToolbar list={list} fields={[]} searchName="search" searchPlaceholder="PO, part number, supplier, MPN…" />
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
