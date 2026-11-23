import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SimpleTable } from './index';

describe('SimpleTable', () => {
  it('renders columns and rows', () => {
    const rows = [{ id: 1, name: 'Item A' }];
    const cols = [{ key: 'name', header: 'Name', render: (r: { id: number; name: string }) => r.name }];

    render(<SimpleTable rows={rows} columns={cols} getRowKey={(r) => r.id} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Item A')).toBeInTheDocument();
  });
});
