import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaymentIcon from '@mui/icons-material/Payment';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test';
import { Sidebar } from './Sidebar';
import { SidebarProvider } from './SidebarContext';
import type { NavGroup } from './types';

const sampleNav: NavGroup[] = [
  {
    title: 'MAIN',
    items: [
      {
        label: 'Dashboard',
        icon: <DashboardIcon />,
        children: [
          { label: 'Project', to: '/dashboard/project', icon: <span /> },
          { label: 'Revenue', to: '/dashboard/revenue', icon: <span /> },
          { label: 'Insights', to: '/dashboard/insights', icon: <span /> },
        ],
      },
      { label: 'Contracts', to: '/contracts', icon: <DescriptionIcon /> },
      { label: 'Payments', to: '/payments', icon: <PaymentIcon /> },
      { label: 'Notification', to: '/notification', icon: <NotificationsIcon />, badge: 3 },
    ],
  },
  {
    title: 'MESSAGES',
    action: { title: 'New Message', onClick: vi.fn() },
    items: [{ label: 'Ester Howard', to: '/messages/ester', icon: <span /> }],
  },
];

describe('Sidebar', () => {
  it('renders branding and navigation sections in expanded mode', async () => {
    renderWithProviders(
      <SidebarProvider defaultCollapsed={false}>
        <Sidebar appName="Document Change Request" nav={sampleNav} isDesktop />
      </SidebarProvider>,
    );

    expect(await screen.findAllByText('Cyient DLM')).toHaveLength(2);
    expect(screen.getByText('Document Change Request')).toBeInTheDocument();
    expect(screen.getByText('MAIN')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Contracts')).toBeInTheDocument();
    expect(screen.getByText('Payments')).toBeInTheDocument();
    expect(screen.getByText('Notification')).toBeInTheDocument();
    expect(screen.getByText('MESSAGES')).toBeInTheDocument();
    expect(screen.getByText('Ester Howard')).toBeInTheDocument();
  });

  it('renders nested submenu tree items', async () => {
    renderWithProviders(
      <SidebarProvider defaultCollapsed={false}>
        <Sidebar appName="Test App" nav={sampleNav} isDesktop />
      </SidebarProvider>,
    );

    expect(await screen.findByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Insights')).toBeInTheDocument();
  });

  it('toggles collapse mode when collapse edge button is clicked', async () => {
    renderWithProviders(
      <SidebarProvider defaultCollapsed={false}>
        <Sidebar appName="Test App" nav={sampleNav} isDesktop />
      </SidebarProvider>,
    );

    const collapseButton = await screen.findByRole('button', { name: /Collapse sidebar/i });
    await userEvent.click(collapseButton);

    expect(await screen.findByRole('button', { name: /Expand sidebar/i })).toBeInTheDocument();
  });

  it('opens popover flyout card for nested items in collapsed mode', async () => {
    renderWithProviders(
      <SidebarProvider defaultCollapsed={true}>
        <Sidebar appName="Test App" nav={sampleNav} isDesktop />
      </SidebarProvider>,
    );

    const dashboardButton = await screen.findByRole('button', { name: 'Dashboard' });
    await userEvent.click(dashboardButton);

    // Submenu items appear in floating popover
    expect(await screen.findByRole('link', { name: 'Project' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Revenue' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Insights' })).toBeInTheDocument();
  });

  it('opens account menu when footer profile is clicked', async () => {
    renderWithProviders(
      <SidebarProvider defaultCollapsed={false}>
        <Sidebar appName="Test App" nav={sampleNav} isDesktop />
      </SidebarProvider>,
    );

    const userAccountButton = await screen.findByRole('button', { name: /User account menu/i });
    await userEvent.click(userAccountButton);

    expect(await screen.findByText('Dark mode')).toBeInTheDocument();
  });
});
