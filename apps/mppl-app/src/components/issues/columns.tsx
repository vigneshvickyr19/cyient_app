import type { IssueListItem } from '@cyient/api-client/mppl';
import { formatCurrency, formatDate, formatDateTime, formatNumber } from '@cyient/shared-utils';
import type { GridColDef } from '@mui/x-data-grid';

/** The columns of today's issue lists (BRD-07 Screen 1), shared by Open Issues, Fixed Issues, pending and administration. */
export const issueColumns = {
  project: { field: 'project', headerName: 'Project', minWidth: 170, sortable: false, valueGetter: (_, row) => row.project.name },
  poNumber: { field: 'poNumber', headerName: 'PO', minWidth: 130 },
  poLineNumber: { field: 'poLineNumber', headerName: 'PO line', minWidth: 80, sortable: false, type: 'number' },
  poDate: { field: 'poDate', headerName: 'PO date', minWidth: 110, sortable: false, valueFormatter: (value: string | null) => formatDate(value) },
  partNumber: { field: 'partNumber', headerName: 'Part number', minWidth: 140, sortable: false },
  issueType: { field: 'issueType', headerName: 'Issue', minWidth: 150, sortable: false, valueGetter: (_, row) => row.issueType.name },
  customerGroup: { field: 'customerGroup', headerName: 'Customer group', minWidth: 140, sortable: false },
  commodity: { field: 'commodity', headerName: 'Commodity', minWidth: 130, sortable: false, valueGetter: (_, row) => row.commodity.name },
  sourcingLead: { field: 'sourcingLead', headerName: 'Sourcing Lead', minWidth: 160, sortable: false, valueGetter: (_, row) => row.sourcingLead.name },
  quantity: { field: 'quantity', headerName: 'Quantity', minWidth: 100, sortable: false, type: 'number', valueFormatter: (value: number | null) => formatNumber(value) },
  supplierName: { field: 'supplierName', headerName: 'Supplier', minWidth: 170, sortable: false },
  mpn: { field: 'mpn', headerName: 'MPN', minWidth: 130, sortable: false },
  make: { field: 'make', headerName: 'Make', minWidth: 120, sortable: false },
  valueImpact: {
    field: 'valueImpact',
    headerName: 'Value impact',
    minWidth: 140,
    type: 'number',
    valueFormatter: (value: number | null, row) => formatCurrency(value, row.currency),
  },
  raisedBy: { field: 'raisedBy', headerName: 'Raised by', minWidth: 150, sortable: false, valueGetter: (_, row) => row.raisedBy.name },
  submittedAt: { field: 'submittedAt', headerName: 'Raised on', minWidth: 160, valueFormatter: (value: string | null) => formatDateTime(value) },
  pendingWith: { field: 'pendingWith', headerName: 'Pending with', minWidth: 170, sortable: false },
  closedAt: { field: 'closedAt', headerName: 'Closed on', minWidth: 160, valueFormatter: (value: string | null) => formatDateTime(value) },
  createdAt: { field: 'createdAt', headerName: 'Saved on', minWidth: 160, valueFormatter: (value: string) => formatDateTime(value) },
} satisfies Record<string, GridColDef<IssueListItem>>;

/** The columns every list starts with, as on today's landing page. */
export const landingColumns: GridColDef<IssueListItem>[] = [
  issueColumns.project,
  issueColumns.poNumber,
  issueColumns.poLineNumber,
  issueColumns.poDate,
  issueColumns.partNumber,
  issueColumns.customerGroup,
  issueColumns.commodity,
  issueColumns.sourcingLead,
  issueColumns.quantity,
  issueColumns.supplierName,
  issueColumns.mpn,
  issueColumns.make,
  issueColumns.issueType,
  issueColumns.valueImpact,
];
