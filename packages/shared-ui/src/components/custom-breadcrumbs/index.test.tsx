import FolderIcon from '@mui/icons-material/Folder';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { CustomBreadcrumbs } from './index';

describe('CustomBreadcrumbs', () => {
  it('renders home crumb and trail of breadcrumb items', () => {
    render(
      <MemoryRouter>
        <CustomBreadcrumbs
          items={[
            { label: 'MRP Exceptions', to: '/mrp-exceptions' },
            { label: 'Request 2026-5766' },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('Home')).toBeInTheDocument();
    expect(screen.getByText('MRP Exceptions')).toBeInTheDocument();
    expect(screen.getByText('Request 2026-5766')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'MRP Exceptions' });
    expect(link).toHaveAttribute('href', '/mrp-exceptions');
  });

  it('marks the last item as current page without a link', () => {
    render(
      <MemoryRouter>
        <CustomBreadcrumbs
          items={[
            { label: 'Settings', to: '/settings' },
            { label: 'Roles' },
          ]}
        />
      </MemoryRouter>,
    );

    const activeItem = screen.getByText('Roles');
    expect(activeItem).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'Roles' })).not.toBeInTheDocument();
  });

  it('hides home crumb when showHome is false', () => {
    render(
      <MemoryRouter>
        <CustomBreadcrumbs
          showHome={false}
          items={[{ label: 'Users', to: '/users' }, { label: 'Details' }]}
        />
      </MemoryRouter>,
    );

    expect(screen.queryByLabelText('Home')).not.toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('renders icons inside breadcrumb items', () => {
    render(
      <MemoryRouter>
        <CustomBreadcrumbs
          items={[
            { label: 'Documents', to: '/docs', icon: <FolderIcon data-testid="folder-icon" /> },
            { label: 'File 1' },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('folder-icon')).toBeInTheDocument();
  });
});
