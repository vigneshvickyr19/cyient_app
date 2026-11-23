import type { IssueListItem, IssueSort } from '@cyient/api-client/mppl';
import { Button, DataTable, DateField, Dropdown, errorMessage, ErrorState, FilterToolbar, Input, LinkButton, PageHeader, PeoplePicker, personOf, SegmentedTabs, Tab, toNumber, useAuth, useFileDownload, useListState, useMasterOptions } from '@cyient/shared-ui';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { exportIssues } from '@/api-callers/issues/issue.api';
import { useMpplApi } from '@/hooks/useMpplApi';
import { permissions } from '@/constants/permissions';
import { QUERY_PARAMS } from '@/constants/query-params';
import { issueColumns, landingColumns } from '@/components/issues/columns';
import type { IssueListQuery } from '@/types/issues';
import { useIssueList } from '@/hooks/issues/queries';
import { isIssueTab, type IssueTab, STATUS_ACTIONS } from '@/constants/issue-status';

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
  QUERY_PARAMS.LIST,
  QUERY_PARAMS.SEARCH,
  QUERY_PARAMS.PROJECT,
  QUERY_PARAMS.COMMODITY,
  QUERY_PARAMS.ISSUE_TYPE,
  QUERY_PARAMS.LEAD,
  QUERY_PARAMS.LEAD_NAME,
  QUERY_PARAMS.RAISED_BY,
  QUERY_PARAMS.RAISED_BY_NAME,
  QUERY_PARAMS.PO,
  QUERY_PARAMS.CUSTOMER_GROUP,
  QUERY_PARAMS.SEGMENT,
  QUERY_PARAMS.SUPPLIER,
  QUERY_PARAMS.FROM,
  QUERY_PARAMS.TO,
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

/** Open Issues (the landing page), Fixed Issues and My drafts: search, filter, sort, open an issue and export to Excel. */
export function IssuesPage() {
  const { can } = useAuth();
  const api = useMpplApi();
  const navigate = useNavigate();
  const list = useListState<Filters>(filterNames);
  const { filters } = list;
  const canCreate = can(permissions.create);
  const tab: IssueTab = isIssueTab(filters.list) && (filters.list !== STATUS_ACTIONS.DRAFTS || canCreate) ? filters.list : STATUS_ACTIONS.OPEN;
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
  const exportList = useFileDownload(() => exportIssues(api, query), `MPPL ${tab} issues.xlsx`);
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

      <SegmentedTabs
        value={tab}
        onChange={(_, value: IssueTab) => {
          list.setFilters({ list: value === STATUS_ACTIONS.OPEN ? undefined : value });
        }}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 2 }}
      >
        <Tab value={STATUS_ACTIONS.OPEN} label="Open issues" />
        <Tab value={STATUS_ACTIONS.FIXED} label="Fixed issues" />
        {canCreate && <Tab value={STATUS_ACTIONS.DRAFTS} label="My drafts" />}
      </SegmentedTabs>

      <FilterToolbar list={list} fields={['project', 'commodity', 'issueType', 'lead', 'leadName', 'raisedBy', 'raisedByName', 'po', 'customerGroup', 'segment', 'supplier', 'from', 'to']} helperFields={['leadName', 'raisedByName']} searchName="search" searchPlaceholder="PO, part number, supplier, MPN…">
        {(filters, change) => (
          <>
            <Dropdown label="Project" options={projects} value={toNumber(filters.project) ?? null} emptyLabel="Any project" onChange={(id) => { change({ project: id?.toString() }); }} />
            <Dropdown label="Commodity" options={commodities} value={toNumber(filters.commodity) ?? null} emptyLabel="Any commodity" onChange={(id) => { change({ commodity: id?.toString() }); }} />
            <Dropdown label="Issue" options={issueTypes} value={toNumber(filters.issueType) ?? null} emptyLabel="Any issue" onChange={(id) => { change({ issueType: id?.toString() }); }} />
            <PeoplePicker
              label="Sourcing Lead"
              value={personOf(filters.lead, filters.leadName)}
              onChange={(lead) => { change({ lead: lead?.id.toString(), leadName: lead?.name }); }}
            />
            <PeoplePicker
              label="Raised by"
              value={personOf(filters.raisedBy, filters.raisedByName)}
              onChange={(buyer) => { change({ raisedBy: buyer?.id.toString(), raisedByName: buyer?.name }); }}
            />
            <Input label="PO number" value={filters.po ?? ''} onChange={(po) => { change({ po }); }} placeholder="The whole PO number" />
            <Input label="Customer group" value={filters.customerGroup ?? ''} onChange={(customerGroup) => { change({ customerGroup }); }} />
            <Input label="Segment" value={filters.segment ?? ''} onChange={(segment) => { change({ segment }); }} />
            <Input label="Supplier" value={filters.supplier ?? ''} onChange={(supplier) => { change({ supplier }); }} />
            <DateField label="Raised from" value={filters.from ?? null} maxDate={filters.to} onChange={(from) => { change({ from: from ?? undefined }); }} />
            <DateField label="Raised to" value={filters.to ?? null} minDate={filters.from} onChange={(to) => { change({ to: to ?? undefined }); }} />
          </>
        )}
      </FilterToolbar>

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
          emptyMessage={tab === STATUS_ACTIONS.DRAFTS && !filtered ? 'Raise one with New issue.' : undefined}
        />
      )}
    </>
  );
}
