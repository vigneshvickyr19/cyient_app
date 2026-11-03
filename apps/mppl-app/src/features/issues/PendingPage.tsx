import type { IssueListItem } from '@cyient/api-client/mppl';
import { DataTable, ErrorState, errorMessage, PageHeader, useListState } from '@cyient/shared-ui';
import { daysSince } from '@cyient/shared-utils';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { issueColumns } from './columns';
import { usePendingIssues } from './queries';

const columns: GridColDef<IssueListItem>[] = [
  { ...issueColumns.poNumber, sortable: false },
  issueColumns.poLineNumber,
  issueColumns.project,
  issueColumns.partNumber,
  issueColumns.supplierName,
  issueColumns.issueType,
  issueColumns.raisedBy,
  { ...issueColumns.submittedAt, headerName: 'With you since', sortable: false },
  {
    field: 'waiting',
    headerName: 'Days waiting',
    minWidth: 110,
    sortable: false,
    type: 'number',
    valueGetter: (_, row) => (row.submittedAt ? daysSince(row.submittedAt) : null),
  },
  issueColumns.pendingWith,
  { ...issueColumns.valueImpact, sortable: false },
];

/** The Sourcing Lead's open issues, longest waiting first, to close once the supplier has answered. */
export function PendingPage() {
  const navigate = useNavigate();
  const list = useListState([]);
  const pending = usePendingIssues(list.page, list.pageSize);

  return (
    <>
      <PageHeader title="Pending with me" subtitle="Open issues waiting for you as their Sourcing Lead, longest waiting first" />
      {pending.isError ? (
        <ErrorState message={errorMessage(pending.error)} onRetry={() => void pending.refetch()} />
      ) : (
        <DataTable<IssueListItem>
          aria-label="Issues pending with me"
          rows={pending.data?.data ?? []}
          columns={columns}
          getRowId={(row) => row.publicId}
          loading={pending.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={pending.data?.meta}
          onPageChange={(page, pageSize) => { list.setPage(page, pageSize); }}
          onRowClick={(row) => void navigate(`/issues/${row.publicId}`)}
          emptyTitle="Nothing is waiting for you"
          emptyMessage="Issues raised for you as Sourcing Lead appear here until you close them."
        />
      )}
    </>
  );
}
