import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test';
import { PeoplePicker } from './index';

describe('PeoplePicker', () => {
  it('renders input with label', async () => {
    renderWithProviders(
      <PeoplePicker
        label="Select Approver"
        value={null}
        onChange={vi.fn()}
      />,
    );

    const combobox = await screen.findByRole('combobox', { name: /Select Approver/i });
    expect(combobox).toBeInTheDocument();
  });

  it('debounces people search queries until typing pauses', async () => {
    const searchCalls: string[] = [];
    const mockUsers = [
      { id: 10, displayName: 'John Doe', email: 'john@example.com', designation: 'Engineer', department: 'R&D' },
    ];

    renderWithProviders(
      <PeoplePicker
        label="Approver"
        value={null}
        onChange={vi.fn()}
        debounceMs={150}
      />,
      {
        routes: {
          'GET /api/v1/directory/users': ({ url }) => {
            const search = url.searchParams.get('search') ?? '';
            searchCalls.push(search);
            return mockUsers.filter((u) => u.displayName.toLowerCase().includes(search.toLowerCase()));
          },
        },
      },
    );

    const combobox = await screen.findByRole('combobox', { name: /Approver/i });
    fireEvent.focus(combobox);
    fireEvent.change(combobox, { target: { value: 'Jo' } });

    // Immediately after typing, debouncing has not resolved yet
    expect(searchCalls).toHaveLength(0);

    // After debounce interval passes, API is called with debounced query
    await waitFor(() => {
      expect(searchCalls).toContain('Jo');
    }, { timeout: 1000 });

    // Option should be rendered
    const option = await screen.findByText('John Doe');
    expect(option).toBeInTheDocument();
  });
});

