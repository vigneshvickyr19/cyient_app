import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './index';

describe('Pagination', () => {
  it('renders pagination with total rows count', () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        meta={{ page: 1, pageSize: 10, totalCount: 25, totalPages: 3 }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/1–10 of 25/i)).toBeInTheDocument();
  });
});
