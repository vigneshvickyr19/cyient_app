import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CustomCheckbox } from './index';

describe('CustomCheckbox', () => {
  it('renders label and toggles checked state', async () => {
    const onChange = vi.fn();
    render(
      <CustomCheckbox
        label="Accept Terms & Conditions"
        checked={false}
        onChange={onChange}
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: /accept terms/i });
    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('renders error message', () => {
    render(
      <CustomCheckbox
        label="I agree"
        checked={false}
        onChange={vi.fn()}
        error="You must agree to continue"
      />,
    );

    expect(screen.getByText('You must agree to continue')).toBeInTheDocument();
  });
});
