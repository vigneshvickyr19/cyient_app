import type { SourcingDetails } from '@cyient/api-client/mppl';
import {
  Button,
  CheckboxField,
  DataTable,
  Dropdown,
  ErrorState,
  errorMessage,
  FilterBar,
  PageHeader,
  PeoplePicker,
  SearchField,
  StatusChip,
  toNumber,
  useListState,
  useMasterOptions,
} from '@cyient/shared-ui';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { IconButton, Tooltip } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { useSourcingList } from './queries';
import { SourcingDialog } from './SourcingForm';

interface Filters {
  search?: string;
  project?: string;
  commodity?: string;
  lead?: string;
  leadName?: string;
  inactive?: string;
}

const filterNames = ['search', 'project', 'commodity', 'lead', 'leadName', 'inactive'] as const;

/** The sourcing master: the Sourcing Lead, escalation levels and engineers of each project (and commodity). */
export function SourcingPage() {
  const list = useListState<Filters>(filterNames);
  const { filters } = list;
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const projects = useMasterOptions('Project');
  const commodities = useMasterOptions('Commodity');
  const rows = useSourcingList({
    Search: filters.search,
    ProjectId: toNumber(filters.project),
    CommodityId: toNumber(filters.commodity),
    SourcingLeadUserId: toNumber(filters.lead),
    IncludeInactive: filters.inactive === 'true' || undefined,
    Page: list.page,
    PageSize: list.pageSize,
  });

  const columns: GridColDef<SourcingDetails>[] = [
    { field: 'project', headerName: 'Project', minWidth: 170, flex: 1, sortable: false, valueGetter: (_, row) => row.project.name },
    { field: 'commodity', headerName: 'Commodity', minWidth: 150, sortable: false, valueGetter: (_, row) => row.commodity?.name ?? 'Every other commodity' },
    { field: 'customerName', headerName: 'Customer', minWidth: 150, sortable: false },
    { field: 'customerGroup', headerName: 'Customer group', minWidth: 140, sortable: false },
    { field: 'segment', headerName: 'Segment', minWidth: 120, sortable: false },
    { field: 'sourcingLead', headerName: 'Sourcing Lead', minWidth: 160, sortable: false, valueGetter: (_, row) => row.sourcingLead.name },
    { field: 'escalation1', headerName: 'Level 1', minWidth: 150, sortable: false, valueGetter: (_, row) => row.escalation1?.name },
    { field: 'escalation2', headerName: 'Level 2', minWidth: 150, sortable: false, valueGetter: (_, row) => row.escalation2?.name },
    { field: 'escalation3', headerName: 'Level 3', minWidth: 150, sortable: false, valueGetter: (_, row) => row.escalation3?.name },
    {
      field: 'isActive',
      headerName: 'Active',
      minWidth: 100,
      sortable: false,
      renderCell: ({ row }) => <StatusChip label={row.isActive ? 'Active' : 'Switched off'} tone={row.isActive ? 'success' : 'neutral'} />,
    },
    {
      field: 'actions',
      headerName: '',
      minWidth: 70,
      sortable: false,
      renderCell: ({ row }) => (
        <Tooltip title="Change">
          <IconButton aria-label={`Change ${row.project.name ?? 'row'} ${row.commodity?.name ?? ''}`.trim()} onClick={() => { setEditing(row.id); }}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Sourcing master"
        subtitle="Who each project's issues go to, and who they are escalated to. A row without a commodity covers the project's other commodities."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing('new'); }}>
            Add row
          </Button>
        }
      />
      <FilterBar active={list.filtered} onClear={list.clearFilters}>
        <SearchField value={filters.search ?? ''} onSearch={(search) => { list.setFilters({ search }); }} placeholder="Customer or customer group" />
        <Dropdown label="Project" options={projects} value={toNumber(filters.project) ?? null} emptyLabel="Any project" onChange={(id) => { list.setFilters({ project: id?.toString() }); }} />
        <Dropdown label="Commodity" options={commodities} value={toNumber(filters.commodity) ?? null} emptyLabel="Any commodity" onChange={(id) => { list.setFilters({ commodity: id?.toString() }); }} />
        <PeoplePicker
          label="Sourcing Lead"
          value={filters.lead ? { id: Number(filters.lead), name: filters.leadName ?? '' } : null}
          onChange={(lead) => { list.setFilters({ lead: lead?.id.toString(), leadName: lead?.name }); }}
        />
        <CheckboxField label="Switched-off rows too" checked={filters.inactive === 'true'} onChange={(inactive) => { list.setFilters({ inactive: inactive ? 'true' : undefined }); }} />
      </FilterBar>
      {rows.isError ? (
        <ErrorState message={errorMessage(rows.error)} onRetry={() => void rows.refetch()} />
      ) : (
        <DataTable<SourcingDetails>
          aria-label="Sourcing master"
          rows={rows.data?.data ?? []}
          columns={columns}
          getRowId={(row) => row.id}
          loading={rows.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={rows.data?.meta}
          onPageChange={(page, pageSize) => { list.setPage(page, pageSize); }}
          emptyTitle={list.filtered ? 'No rows match these filters' : 'The sourcing master is empty'}
          emptyMessage={list.filtered ? undefined : 'Add a row for each project so issues can be raised against it.'}
        />
      )}
      {editing !== null && <SourcingDialog id={editing === 'new' ? null : editing} onClose={() => { setEditing(null); }} />}
    </>
  );
}
