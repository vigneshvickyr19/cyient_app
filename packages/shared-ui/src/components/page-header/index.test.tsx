import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { PageHeader } from './index';

describe('PageHeader', () => {
  it('renders title and subtitle', () => {
    render(
      <MemoryRouter>
        <PageHeader title="Deviation Details" subtitle="Ref: DEV-2026-001" />
      </MemoryRouter>,
    );

    expect(screen.getByText('Deviation Details')).toBeInTheDocument();
    expect(screen.getByText('Ref: DEV-2026-001')).toBeInTheDocument();
  });

  it('renders breadcrumbs with home icon and navigation items', () => {
    render(
      <MemoryRouter>
        <PageHeader
          title="Request Form"
          breadcrumbs={[
            { label: 'Requests', to: '/requests' },
            { label: 'New Request' },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('Home')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Requests' })).toHaveAttribute('href', '/requests');
    expect(screen.getByText('New Request')).toBeInTheDocument();
  });
});
