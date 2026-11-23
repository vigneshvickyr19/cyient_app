import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './index';

describe('EmptyState', () => {
  it('renders title and message', () => {
    render(<EmptyState title="No items found" message="Try searching for something else" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Try searching for something else')).toBeInTheDocument();
  });
});
