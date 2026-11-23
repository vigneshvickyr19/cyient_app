import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CustomDrawer } from './index';

describe('CustomDrawer', () => {
  it('renders title, content, and footer action buttons when open', () => {
    const handleClose = vi.fn();
    const handleApply = vi.fn();
    const handleReset = vi.fn();

    render(
      <CustomDrawer
        open={true}
        onClose={handleClose}
        title="Filter MRF"
        subtitle="Refine candidate records"
        onApply={handleApply}
        onReset={handleReset}
      >
        <div data-testid="filter-content">Filter Fields Here</div>
      </CustomDrawer>,
    );

    expect(screen.getByText('Filter MRF')).toBeInTheDocument();
    expect(screen.getByText('Refine candidate records')).toBeInTheDocument();
    expect(screen.getByTestId('filter-content')).toBeInTheDocument();

    const applyButton = screen.getByRole('button', { name: 'Apply' });
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    const closeButton = screen.getByRole('button', { name: 'Close drawer' });

    expect(applyButton).toBeInTheDocument();
    expect(resetButton).toBeInTheDocument();

    fireEvent.click(applyButton);
    expect(handleApply).toHaveBeenCalledTimes(1);

    fireEvent.click(resetButton);
    expect(handleReset).toHaveBeenCalledTimes(1);

    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('hides footer when hideFooter is true', () => {
    render(
      <CustomDrawer open={true} onClose={vi.fn()} title="Filter MRF" hideFooter>
        <div>Content</div>
      </CustomDrawer>,
    );

    expect(screen.queryByRole('button', { name: 'Apply' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument();
  });

  it('renders custom footer if provided', () => {
    render(
      <CustomDrawer
        open={true}
        onClose={vi.fn()}
        footer={<button data-testid="custom-action">Custom Action</button>}
      >
        <div>Content</div>
      </CustomDrawer>,
    );

    expect(screen.getByTestId('custom-action')).toBeInTheDocument();
  });
});
