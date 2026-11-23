import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterBar, SearchField } from './index';

describe('SearchFilter', () => {
  it('renders SearchField and responds to typing Enter', async () => {
    const onSearch = vi.fn();
    render(<SearchField value="" onSearch={onSearch} placeholder="Search records" />);

    const input = screen.getByPlaceholderText('Search records');
    await userEvent.type(input, 'hydraulic{Enter}');
    expect(onSearch).toHaveBeenCalledWith('hydraulic');
  });

  it('renders FilterBar with clear action', async () => {
    const onClear = vi.fn();
    render(
      <FilterBar active onClear={onClear}>
        <div>Filter item</div>
      </FilterBar>,
    );

    const clearBtn = screen.getByRole('button', { name: /Clear filters/i });
    await userEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalled();
  });
});
