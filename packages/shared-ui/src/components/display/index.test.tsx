import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DetailList, InlineAlert, SectionCard, StatusChip } from './index';

describe('display components', () => {
  it('renders StatusChip', () => {
    render(<StatusChip label="Active" tone="success" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders DetailList', () => {
    render(<DetailList items={[{ label: 'Owner', value: 'Jane' }]} />);
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });

  it('renders SectionCard', () => {
    render(<SectionCard title="Overview">Card content</SectionCard>);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders InlineAlert', () => {
    render(<InlineAlert title="Attention">Something happened</InlineAlert>);
    expect(screen.getByText('Attention')).toBeInTheDocument();
    expect(screen.getByText('Something happened')).toBeInTheDocument();
  });
});
