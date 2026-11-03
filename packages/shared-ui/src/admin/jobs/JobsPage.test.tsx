import type { JobItem } from '@cyient/api-client/platform';
import { configure, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { errorResponse, renderWithProviders, type MockRoutes } from '../../test';
import { AdminArea } from '../AdminArea';
// The pages load lazily; importing them here first means the routes render without waiting for them to compile
import './JobsPage';

const jobs: JobItem[] = [
  { name: 'ReviewReminders', dailyAt: '09:00', timeZone: 'Asia/Kolkata', enabled: true, nextRun: '2026-11-04T03:30:00Z' },
  { name: 'DirectorySync', dailyAt: '02:00', timeZone: 'Asia/Kolkata', enabled: false, nextRun: null },
];

const renderJobs = (routes: MockRoutes) =>
  renderWithProviders(
    <Routes>
      <Route path="admin/*" element={<AdminArea />} />
    </Routes>,
    { path: '/admin/jobs', routes: { 'GET /api/v1/admin/jobs': () => jobs, ...routes }, me: { permissions: ['platform.job.run'] } },
  );

// Pages render the whole provider tree and MUI; give slow machines time
configure({ asyncUtilTimeout: 5000 });

describe('Jobs', () => {
  it('runs a job after confirming and shows its result', async () => {
    const ran = vi.fn();
    renderJobs({
      'POST /api/v1/admin/jobs/{name}/run': ({ params }) => {
        ran(params.name);
        return { name: params.name, startedAt: '2026-11-03T08:00:00Z', durationMs: 1500 };
      },
    });

    await userEvent.click(await screen.findByRole('button', { name: 'Run Review Reminders now' }));
    const dialog = await screen.findByRole('dialog', { name: /Run Review Reminders now\?/ });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Run now' }));

    expect(await screen.findByText('Review Reminders finished')).toBeInTheDocument();
    expect(ran).toHaveBeenCalledWith('ReviewReminders');
    expect(screen.getAllByText(/took 1\.5 seconds/).length).toBeGreaterThan(0);
  });

  it('shows why a job failed', async () => {
    renderJobs({
      'POST /api/v1/admin/jobs/{name}/run': () => errorResponse(400, 'JOB_FAILED', 'The directory could not be reached.'),
    });

    await userEvent.click(await screen.findByRole('button', { name: 'Run Directory Sync now' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Run now' }));

    expect(await screen.findByText('Directory Sync failed')).toBeInTheDocument();
    expect(screen.getAllByText('The directory could not be reached.').length).toBeGreaterThan(0);
  });

  it('is closed to people without the permission', async () => {
    renderWithProviders(
      <Routes>
        <Route path="admin/*" element={<AdminArea />} />
      </Routes>,
      { path: '/admin/jobs' },
    );

    expect(await screen.findByText('No access')).toBeInTheDocument();
  });
});
