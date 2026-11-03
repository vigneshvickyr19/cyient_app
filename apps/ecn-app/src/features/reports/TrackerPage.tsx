import { Button, Dropdown, ErrorState, errorMessage, PageHeader, SectionCard, SectionSkeleton, useFileDownload, useListState } from '@cyient/shared-ui';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { Stack } from '@mui/material';
import { useEcnApi } from '../../lib/api';
import { useCustomers } from '../masters/queries';

interface Filters {
  customer?: string;
}

/** The ECN Tracker (QMS format) in Excel: every ECN, open and closed, for all customers or one. */
export function TrackerPage() {
  const api = useEcnApi();
  const list = useListState<Filters>(['customer']);
  const customers = useCustomers();
  const customerId = list.filters.customer ? Number(list.filters.customer) : undefined;
  const tracker = useFileDownload(() => api.download('/api/v1/tracker', { query: { customerId } }), 'ECN Tracker.xlsx');
  const options = (customers.data ?? []).map((customer) => ({ value: customer.id, label: customer.name }));

  return (
    <>
      <PageHeader title="ECN Tracker" subtitle="Every ECN, open and closed, with its front page, owner and each CFT function's actions" />
      <SectionCard title="Download the Tracker" subheader="In the QMS format. Actions not yet started show as Yet to start.">
        {customers.isPending ? (
          <SectionSkeleton rows={2} />
        ) : customers.isError ? (
          <ErrorState message={errorMessage(customers.error)} onRetry={() => void customers.refetch()} />
        ) : (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
            <Dropdown
              label="Customer"
              options={options}
              value={customerId ?? null}
              emptyLabel="All customers"
              onChange={(id) => { list.setFilters({ customer: id?.toString() }); }}
              sx={{ minWidth: 260 }}
            />
            <Button variant="contained" startIcon={<FileDownloadOutlinedIcon />} loading={tracker.isPending} onClick={() => { tracker.mutate(); }}>
              Download Excel
            </Button>
          </Stack>
        )}
      </SectionCard>
    </>
  );
}
