import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageLoader, SectionSkeleton } from './index';

describe('Loader components', () => {
  it('renders PageLoader with label', () => {
    render(<PageLoader label="Fetching records..." />);
    expect(screen.getByText('Fetching records...')).toBeInTheDocument();
  });

  it('renders SectionSkeleton with status role', () => {
    render(<SectionSkeleton rows={3} />);
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
  });
});
