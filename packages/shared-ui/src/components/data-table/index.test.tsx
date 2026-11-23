import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from './index';

interface TestRow {
  id: number;
  name: string;
  role: string;
}

describe('DataTable', () => {
  const rows: TestRow[] = [
    { id: 1, name: 'Alice Smith', role: 'Engineer' },
    { id: 2, name: 'Bob Jones', role: 'Manager' },
  ];

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Full Name', width: 150 },
    { field: 'role', headerName: 'Designation', width: 130 },
  ];

  it('renders rows, column headers, and records count in custom pagination', () => {
    render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        page={1}
        pageSize={10}
        meta={{ page: 1, pageSize: 10, totalCount: 2, totalPages: 1 }}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('Full Name')).toBeInTheDocument();
    expect(screen.getByText('Results 1–2 of 2 ( Page 1 of 1 )')).toBeInTheDocument();
    expect(screen.getByText('Rows per page:')).toBeInTheDocument();
  });

  it('displays -- for null, undefined, empty, or unavailable cell values', () => {
    interface SparseRow {
      id: number;
      name?: string | null;
      code?: string | null;
      count?: number | null;
    }
    const sparseRows: SparseRow[] = [
      { id: 1, name: null, code: '', count: undefined },
      { id: 2, name: 'Valid Name', code: '   ', count: 0 },
    ];
    const sparseCols = [
      { field: 'name', headerName: 'Name', width: 120 },
      { field: 'code', headerName: 'Code', width: 120 },
      { field: 'count', headerName: 'Count', width: 120 },
    ];

    render(
      <DataTable
        rows={sparseRows}
        columns={sparseCols}
        getRowId={(r) => r.id}
      />,
    );

    // Row 1 has 3 empty cells (name: null, code: '', count: undefined)
    // Row 2 has 1 empty cell (code: '   '), and count: 0 which should be '0'
    const dashes = screen.getAllByText('--');
    expect(dashes.length).toBe(4);
    expect(screen.getByText('Valid Name')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles custom pagination page change', () => {
    const handlePageChange = vi.fn();
    render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        page={1}
        pageSize={2}
        meta={{ page: 1, pageSize: 2, totalCount: 10, totalPages: 5 }}
        onPageChange={handlePageChange}
      />,
    );

    expect(screen.getByText('Results 1–2 of 10 ( Page 1 of 5 )')).toBeInTheDocument();
    const page2Button = screen.getByRole('button', { name: /go to page 2/i });
    fireEvent.click(page2Button);
    expect(handlePageChange).toHaveBeenCalledWith(2, 2);
  });

  it('renders default empty state with "No Data Found" when no rows are available', () => {
    render(
      <DataTable
        rows={[]}
        columns={columns}
        getRowId={(r: TestRow) => r.id}
      />,
    );

    expect(screen.getByText('No Data Found')).toBeInTheDocument();
    expect(screen.getByText('There are currently no records to display.')).toBeInTheDocument();
  });

  it('supports custom emptyTitle and emptyMessage', () => {
    render(
      <DataTable
        rows={[]}
        columns={columns}
        getRowId={(r: TestRow) => r.id}
        emptyTitle="Custom Empty"
        emptyMessage="Custom empty message"
      />,
    );

    expect(screen.getByText('Custom Empty')).toBeInTheDocument();
    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });

  it('renders default No Data Found and no pagination when rows is empty', () => {
    const { container } = render(
      <DataTable
        rows={[]}
        columns={columns}
        getRowId={(r: TestRow) => r.id}
      />,
    );

    expect(screen.getByText('No Data Found')).toBeInTheDocument();
    expect(screen.getByText('There are currently no records to display.')).toBeInTheDocument();
    // Headers should still be rendered
    expect(screen.getByText('Full Name')).toBeInTheDocument();
    expect(screen.getByText('Designation')).toBeInTheDocument();
    // No pagination footer should be rendered
    expect(container.querySelector('.MuiPagination-root')).not.toBeInTheDocument();
    expect(screen.queryByText(/Results/i)).not.toBeInTheDocument();
  });

  it('renders skeleton rows without circle bar loader when loading is true with empty rows', () => {
    const { container } = render(
      <DataTable
        rows={[]}
        columns={columns}
        getRowId={(r: TestRow) => r.id}
        loading
        skeletonRows={5}
      />,
    );

    // No CircularProgress or LinearProgress bar
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    // No empty state message while loading
    expect(screen.queryByText('No Data Found')).not.toBeInTheDocument();
    // Column headers are still visible
    expect(screen.getByText('Full Name')).toBeInTheDocument();
    expect(screen.getByText('Designation')).toBeInTheDocument();
    // Skeleton cells are rendered (5 rows * 3 columns = 15 skeletons)
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBe(15);
  });

  it('supports custom skeletonRows count and checkboxSelection skeletons', () => {
    const { container } = render(
      <DataTable
        rows={[]}
        columns={columns}
        getRowId={(r: TestRow) => r.id}
        loading
        skeletonRows={3}
        checkboxSelection
      />,
    );

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    // 3 rows * (1 checkbox skeleton + 3 column skeletons) = 12 skeletons
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBe(12);
  });

  it('supports sticky columns and frozen columns count', () => {
    const { container } = render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        freezeLeftColumnsCount={1}
        freezeRightColumnsCount={1}
        checkboxSelection
      />,
    );

    expect(container.querySelector('.MuiDataGrid-root')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  it('triggers onRowClick when a row is clicked', () => {
    const handleRowClick = vi.fn();
    render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        onRowClick={handleRowClick}
      />,
    );

    const cell = screen.getByText('Alice Smith');
    fireEvent.click(cell);
    expect(handleRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it('renders header with search, export, and custom action buttons', () => {
    const handleSearch = vi.fn();
    const handleExport = vi.fn();
    const handleAction = vi.fn();

    render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        tableTitle="Employees List"
        onSearchChange={handleSearch}
        searchPlaceholder="Filter employees..."
        showExportButton
        onExportClick={handleExport}
        actions={[
          {
            id: 'btn-create',
            label: '+ Add Employee',
            onClick: handleAction,
          },
        ]}
      />,
    );

    expect(screen.getByText('Employees List')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter employees...')).toBeInTheDocument();

    const exportBtn = screen.getByRole('button', { name: 'Export' });
    expect(exportBtn).toBeInTheDocument();
    fireEvent.click(exportBtn);
    expect(handleExport).toHaveBeenCalledTimes(1);

    const addBtn = screen.getByRole('button', { name: '+ Add Employee' });
    expect(addBtn).toBeInTheDocument();
    fireEvent.click(addBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('opens filter drawer with filterContent when Filter button is clicked', () => {
    const handleApply = vi.fn();
    const handleReset = vi.fn();

    render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        filterButtonLabel="Filter MRF"
        filterDrawerTitle="Filter MRF"
        filterDrawerContent={
          <div data-testid="drawer-fields">
            <input placeholder="Status dropdown" />
          </div>
        }
        onFilterApply={handleApply}
        onFilterReset={handleReset}
      />,
    );

    const filterBtn = screen.getByRole('button', { name: 'Filter MRF' });
    expect(filterBtn).toBeInTheDocument();

    // Click filter button to open drawer
    fireEvent.click(filterBtn);

    expect(screen.getByText('Filter MRF', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByTestId('drawer-fields')).toBeInTheDocument();

    const applyBtn = screen.getByRole('button', { name: 'Apply' });
    fireEvent.click(applyBtn);
    expect(handleApply).toHaveBeenCalledTimes(1);

    const resetBtn = screen.getByRole('button', { name: 'Reset' });
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
