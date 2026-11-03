import type { IssueListItem, IssueSort } from '@cyient/api-client/mppl';
import {
  Button,
  DataTable,
  DateField,
  Dropdown,
  ErrorState,
  errorMessage,
  FilterBar,
  LinkButton,
  PageHeader,
  PeoplePicker,
  SearchField,
  toNumber,
  useAuth,
  useFileDownload,
  useListState,
  useMasterOptions,
  type PersonOption,
} from '@cyient/shared-ui';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { Tab, Tabs } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { useMpplApi } from '../../lib/api';
import { permissions } from '../../lib/permissions';
import { issueColumns, landingColumns } from './columns';
import type { IssueListQuery } from './keys';
import { useIssueList } from './queries';
import { isIssueTab, type IssueTab } from './status';

interface Filters {
  list?: string;
  search?: string;
  project?: string;
  commodity?: string;
  issueType?: string;
  lead?: string;
  leadName?: string;
  raisedBy?: string;
  raisedByName?: string;
  po?: string;
  customerGroup?: string;
  segment?: string;
  supplier?: string;
  from?: string;
  to?: string;
}

const filterNames = [
  'list',
  'search',
  'project',
  'commodity',
  'issueType',
  'lead',
  'leadName',
  'raisedBy',
  'raisedByName',
  'po',
  'customerGroup',
  'segment',
  'supplier',
  'from',
  'to',
] as const;

/** Grid columns the API can sort by, and its name for each. */
const sortFields: Record<string, IssueSort> = {
  poNumber: 'PoNumber',
  valueImpact: 'ValueImpact',
  submittedAt: 'Submitted',
  closedAt: 'Closed',
  createdAt: 'Created',
};

const tabColumns: Record<IssueTab, GridColDef<IssueListItem>[]> = {
  Open: [...landingColumns, issueColumns.submittedAt, issueColumns.pendingWith],
  Fixed: [...landingColumns, issueColumns.submittedAt, issueColumns.closedAt],
  Drafts: [...landingColumns, issueColumns.createdAt],
};

const tabText: Record<IssueTab, { subtitle: string; empty: string }> = {
  Open: { subtitle: 'Issues waiting for their Sourcing Lead', empty: 'No open issues' },
  Fixed: { subtitle: 'Issues the Sourcing Lead has closed', empty: 'No fixed issues' },
  Drafts: { subtitle: 'Issues you have saved but not yet submitted', empty: 'You have no drafts' },
};

const person = (id: string | undefined, name: string | undefined): PersonOption | null => (id ? { id: Number(id), name: name ?? '' } : null);

/** Open Issues (the landing page), Fixed Issues and My drafts: search, filter, sort, open an issue and export to Excel. */
export function IssuesPage() {
  const { can } = useAuth();
  const api = useMpplApi();
  const navigate = useNavigate();
  const list = useListState<Filters>(filterNames);
  const { filters } = list;
  const canCreate = can(permissions.create);
  const tab: IssueTab = isIssueTab(filters.list) && (filters.list !== 'Drafts' || canCreate) ? filters.list : 'Open';
  const projects = useMasterOptions('Project');
  const commodities = useMasterOptions('Commodity');
  const issueTypes = useMasterOptions('IssueType');

  const query: IssueListQuery = {
    List: tab,
    Search: filters.search,
    ProjectId: toNumber(filters.project),
    CommodityId: toNumber(filters.commodity),
    IssueTypeId: toNumber(filters.issueType),
    SourcingLeadUserId: toNumber(filters.lead),
    RaisedByUserId: toNumber(filters.raisedBy),
    PoNumber: filters.po,
    CustomerGroup: filters.customerGroup,
    Segment: filters.segment,
    SupplierName: filters.supplier,
    From: filters.from,
    To: filters.to,
    Sort: list.sort ? sortFields[list.sort.field] : undefined,
    Descending: list.sort?.descending,
    Page: list.page,
    PageSize: list.pageSize,
  };
  const issues = useIssueList(query);
  const exportList = useFileDownload(
    () => api.download('/api/v1/issues/export', { query: { ...query, Page: undefined, PageSize: undefined } }),
    `MPPL ${tab} issues.xlsx`,
  );
  const filtered = filterNames.some((name) => name !== 'list' && Boolean(filters[name]));

  return (
    <>
      <PageHeader
        title="Issues"
        subtitle={tabText[tab].subtitle}
        actions={
          <>
            {can(permissions.export) && (
              <Button startIcon={<FileDownloadOutlinedIcon />} loading={exportList.isPending} onClick={() => { exportList.mutate(); }}>
                Export to Excel
              </Button>
            )}
            {canCreate && (
              <LinkButton variant="contained" startIcon={<AddIcon />} to="/issues/new">
                New issue
              </LinkButton>
            )}
          </>
        }
      />

      <Tabs
        value={tab}
        onChange={(_, value: IssueTab) => {
          list.setFilters({ list: value === 'Open' ? undefined : value });
        }}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 2 }}
      >
        <Tab value="Open" label="Open issues" />
        <Tab value="Fixed" label="Fixed issues" />
        {canCreate && <Tab value="Drafts" label="My drafts" />}
      </Tabs>

      <FilterBar
        active={filtered}
        onClear={() => {
          list.setFilters({
            search: undefined,
            project: undefined,
            commodity: undefined,
            issueType: undefined,
            lead: undefined,
            leadName: undefined,
            raisedBy: undefined,
            raisedByName: undefined,
            po: undefined,
            customerGroup: undefined,
            segment: undefined,
            supplier: undefined,
            from: undefined,
            to: undefined,
          });
        }}
      >
        <SearchField value={filters.search ?? ''} onSearch={(search) => { list.setFilters({ search }); }} placeholder="PO, part number, supplier, MPN…" />
        <Dropdown label="Project" options={projects} value={toNumber(filters.project) ?? null} emptyLabel="Any project" onChange={(id) => { list.setFilters({ project: id?.toString() }); }} />
        <Dropdown label="Commodity" options={commodities} value={toNumber(filters.commodity) ?? null} emptyLabel="Any commodity" onChange={(id) => { list.setFilters({ commodity: id?.toString() }); }} />
        <Dropdown label="Issue" options={issueTypes} value={toNumber(filters.issueType) ?? null} emptyLabel="Any issue" onChange={(id) => { list.setFilters({ issueType: id?.toString() }); }} />
        <PeoplePicker
          label="Sourcing Lead"
          value={person(filters.lead, filters.leadName)}
          onChange={(lead) => { list.setFilters({ lead: lead?.id.toString(), leadName: lead?.name }); }}
        />
        <PeoplePicker
          label="Raised by"
          value={person(filters.raisedBy, filters.raisedByName)}
          onChange={(buyer) => { list.setFilters({ raisedBy: buyer?.id.toString(), raisedByName: buyer?.name }); }}
        />
        <SearchField label="PO number" value={filters.po ?? ''} onSearch={(po) => { list.setFilters({ po }); }} placeholder="The whole PO number" />
        <SearchField label="Customer group" value={filters.customerGroup ?? ''} onSearch={(customerGroup) => { list.setFilters({ customerGroup }); }} />
        <SearchField label="Segment" value={filters.segment ?? ''} onSearch={(segment) => { list.setFilters({ segment }); }} />
        <SearchField label="Supplier" value={filters.supplier ?? ''} onSearch={(supplier) => { list.setFilters({ supplier }); }} />
        <DateField label="Raised from" value={filters.from ?? null} maxDate={filters.to} onChange={(from) => { list.setFilters({ from: from ?? undefined }); }} />
        <DateField label="Raised to" value={filters.to ?? null} minDate={filters.from} onChange={(to) => { list.setFilters({ to: to ?? undefined }); }} />
      </FilterBar>

      {issues.isError ? (
        <ErrorState message={errorMessage(issues.error)} onRetry={() => void issues.refetch()} />
      ) : (
        <DataTable<IssueListItem>
          aria-label={tabText[tab].subtitle}
          rows={issues.data?.data ?? []}
          columns={tabColumns[tab]}
          getRowId={(row) => row.publicId}
          loading={issues.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={issues.data?.meta}
          onPageChange={(page, pageSize) => { list.setPage(page, pageSize); }}
          sort={list.sort}
          onSortChange={list.setSort}
          onRowClick={(row) => void navigate(`/issues/${row.publicId}`)}
          emptyTitle={filtered ? 'No issues match these filters' : tabText[tab].empty}
          emptyMessage={tab === 'Drafts' && !filtered ? 'Raise one with New issue.' : undefined}
        />
      )}
    </>
  );
}
