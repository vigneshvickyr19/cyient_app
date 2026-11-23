import { screen } from '@testing-library/react';
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
});
