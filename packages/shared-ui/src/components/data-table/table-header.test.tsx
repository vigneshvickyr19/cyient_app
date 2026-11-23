import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataTableHeader } from './table-header';

describe('DataTableHeader', () => {
  it('renders title, search input, and calls onSearchChange after debounce', async () => {
    const handleSearch = vi.fn();

    render(
      <DataTableHeader
        title="Escalations"
        subtitle="Manage and track supplier escalations"
        onSearchChange={handleSearch}
        searchDebounceMs={50}
      />,
    );

    expect(screen.getByText('Escalations')).toBeInTheDocument();
    expect(screen.getByText('Manage and track supplier escalations')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'Supplier ABC' } });

    await waitFor(() => {
      expect(handleSearch).toHaveBeenCalledWith('Supplier ABC');
    });

    // Clear search button should appear
    const clearBtn = screen.getByRole('button', { name: 'Clear search' });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);

    expect(handleSearch).toHaveBeenCalledWith('');
  });

  it('renders Filter button with badge and triggers onFilterClick', () => {
    const handleFilter = vi.fn();

    render(
      <DataTableHeader
        showFilterButton
        filterButtonLabel="Filter MRF"
        filterActiveCount={3}
        onFilterClick={handleFilter}
      />,
    );

    const filterBtn = screen.getByRole('button', { name: 'Filter MRF' });
    expect(filterBtn).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    fireEvent.click(filterBtn);
    expect(handleFilter).toHaveBeenCalledTimes(1);
  });

  it('renders Export button and supports loading state', () => {
    const handleExport = vi.fn();

    const { rerender } = render(
      <DataTableHeader
        showExportButton
        exportButtonLabel="Export CSV"
        onExportClick={handleExport}
      />,
    );

    const exportBtn = screen.getByRole('button', { name: 'Export CSV' });
    expect(exportBtn).toBeInTheDocument();
    fireEvent.click(exportBtn);
    expect(handleExport).toHaveBeenCalledTimes(1);

    // Rerender with loading
    rerender(
      <DataTableHeader
        showExportButton
        exportButtonLabel="Export CSV"
        exportLoading={true}
        onExportClick={handleExport}
      />,
    );

    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders custom actions with render props and standard ActionButton', () => {
    const handleCustom = vi.fn();

    render(
      <DataTableHeader
        actions={[
          {
            id: 'custom-btn',
            label: '+ New Entry',
            onClick: handleCustom,
          },
          {
            id: 'render-slot',
            render: () => <span data-testid="custom-render">Slot Rendered</span>,
          },
        ]}
      />,
    );

    const newBtn = screen.getByRole('button', { name: '+ New Entry' });
    expect(newBtn).toBeInTheDocument();
    fireEvent.click(newBtn);
    expect(handleCustom).toHaveBeenCalledTimes(1);

    expect(screen.getByTestId('custom-render')).toBeInTheDocument();
  });
});
