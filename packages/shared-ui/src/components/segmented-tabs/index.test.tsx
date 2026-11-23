import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedTabs, Tab } from './index';

describe('SegmentedTabs', () => {
  it('is a tab list that reports the segment the user picks', async () => {
    const onChange = vi.fn();
    render(
      <SegmentedTabs value="All" onChange={(_, value: string) => { onChange(value); }}>
        <Tab value="All" label="All requests" />
        <Tab value="Mine" label="My requests" />
      </SegmentedTabs>,
    );

    expect(screen.getByRole('tab', { name: 'All requests' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(screen.getByRole('tab', { name: 'My requests' }));
    expect(onChange).toHaveBeenCalledWith('Mine');
  });
});
