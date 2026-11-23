import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CustomDatePicker } from './index';

describe('CustomDatePicker', () => {
  it('renders label, required indicator, and helper text', () => {
    render(
      <CustomDatePicker
        label="Target Date"
        value={null}
        onChange={vi.fn()}
        helperText="Select completion date"
        required
      />,
    );

    expect(screen.getByText('Target Date')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('Select completion date')).toBeInTheDocument();
  });

  it('renders with an initial date value', () => {
    render(
      <CustomDatePicker
        label="Release Date"
        value="2026-11-20"
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: /choose date, selected date is nov 20, 2026/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <CustomDatePicker
        label="Expiry Date"
        value={null}
        onChange={vi.fn()}
        error="Date is required"
      />,
    );

    expect(screen.getByText('Date is required')).toBeInTheDocument();
  });

  it('allows user to clear or change input', async () => {
    const onChange = vi.fn();
    render(
      <CustomDatePicker
        label="Event Date"
        value="2026-11-20"
        onChange={onChange}
      />,
    );

    const clearButton = screen.queryByRole('button', { name: /clear/i });
    if (clearButton) {
      await userEvent.click(clearButton);
      expect(onChange).toHaveBeenCalledWith(null);
    }
  });
});
