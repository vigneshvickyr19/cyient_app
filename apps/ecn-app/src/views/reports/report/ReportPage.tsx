import type { ReportItem } from '@cyient/api-client/ecn';
import { Button, Dropdown, errorMessage, ErrorState, FilterToolbar, PageHeader, SectionCard, SectionSkeleton, type SimpleColumn, SimpleTable, StatusChip, useAuth, useFileDownload, useListState } from '@cyient/shared-ui';
import { formatDate } from '@cyient/shared-utils';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import { exportOpenEcnReport } from '@/api-callers/reports/report.api';
import { useEcnApi } from '@/hooks/useEcnApi';
import { permissions } from '@/constants/permissions';
import { QUERY_PARAMS } from '@/constants/query-params';
import { useCustomerOptions } from '@/hooks/masters/queries';
import { statusInfo } from '@/constants/note-status';
import { useOpenEcnReport } from '@/hooks/reports/queries';

interface Filters {
  customer?: string;
}

const columns: SimpleColumn<ReportItem>[] = [
  {
    key: 'noteNo',
    header: 'ECN number',
    width: 140,
    render: (row) => (
      <Link component={RouterLink} to={`/notes/${row.publicId}`}>
        {row.noteNo}
      </Link>
    ),
  },
  { key: 'customer', header: 'Customer', render: (row) => row.customer.name },
  { key: 'product', header: 'Product number', render: (row) => row.productNumber },
  { key: 'customerEcn', header: 'Customer ECN no', render: (row) => row.customerEcnNumber ?? '—' },
  { key: 'initiator', header: 'Initiator', render: (row) => row.initiator.name },
  { key: 'status', header: 'Status', render: (row) => <StatusChip {...statusInfo[row.status]} />, width: 170 },
  { key: 'targetDate', header: 'Target date', render: (row) => formatDate(row.targetDate) || '—', width: 120 },
  {
    key: 'open',
    header: 'Open actions with',
    render: (row) =>
      row.openActions.length === 0 ? (
        '—'
      ) : (
        <Stack spacing={0.25}>
          {row.openActions.map((pending) => (
            <Typography key={pending.functionName} variant="body2">
              {pending.functionName}: {pending.member ?? 'nobody named'} ({pending.openActions})
            </Typography>
          ))}
        </Stack>
      ),
  },
];

/** The Report tab: open ECNs only, with who still holds open CFT actions, on screen and in Excel. */
export function ReportPage() {
  const { can } = useAuth();
  const api = useEcnApi();
  const list = useListState<Filters>([QUERY_PARAMS.CUSTOMER]);
  const customers = useCustomerOptions();
  const customerId = list.filters.customer ? Number(list.filters.customer) : undefined;
  const report = useOpenEcnReport(customerId);
  const exportReport = useFileDownload(() => exportOpenEcnReport(api, customerId), 'ECN Report.xlsx');

  return (
    <>
      <PageHeader
        title="Report"
        subtitle="Open ECNs and the CFT members still holding open actions"
        actions={
          can(permissions.export) && (
            <Button startIcon={<FileDownloadOutlinedIcon />} loading={exportReport.isPending} onClick={() => { exportReport.mutate(); }}>
              Export to Excel
            </Button>
          )
        }
      />
      <FilterToolbar list={list} fields={['customer']}>
        {(_, change) => (
          <>
            <Dropdown label="Customer" options={customers} value={customerId ?? null} emptyLabel="All customers" onChange={(id) => { change({ customer: id?.toString() }); }} />
          </>
        )}
      </FilterToolbar>
      <SectionCard title="Open ECNs" subheader={report.data ? `${report.data.length} open` : undefined} flush>
        {report.isPending ? (
          <SectionSkeleton />
        ) : report.isError ? (
          <ErrorState message={errorMessage(report.error)} onRetry={() => void report.refetch()} />
        ) : (
          <SimpleTable<ReportItem>
            aria-label="Open ECNs"
            rows={report.data}
            columns={columns}
            getRowKey={(row) => row.publicId}
            emptyTitle={customerId ? 'No open ECNs for this customer' : 'No open ECNs'}
          />
        )}
      </SectionCard>
    </>
  );
}
