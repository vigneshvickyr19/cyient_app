import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CustomRadioGroup } from './index';

const radioOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'na', label: 'Not Applicable', disabled: true },
];

describe('CustomRadioGroup', () => {
  it('renders label and options', () => {
    render(
      <CustomRadioGroup
        label="Required Action"
        value={null}
        onChange={vi.fn()}
        options={radioOptions}
        helperText="Select one response"
        required
      />,
    );

    expect(screen.getByText('Required Action')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Select one response')).toBeInTheDocument();
  });

  it('selects option when clicked', async () => {
    const onChange = vi.fn();
    render(
      <CustomRadioGroup
        label="Choice"
        value="no"
        onChange={onChange}
        options={radioOptions}
      />,
    );

    const yesRadio = screen.getByRole('radio', { name: 'Yes' });
    await userEvent.click(yesRadio);

    expect(onChange).toHaveBeenCalledWith('yes');
  });

  it('shows error text', () => {
    render(
      <CustomRadioGroup
        label="Approval Decision"
        value={null}
        onChange={vi.fn()}
        options={radioOptions}
        error="Selection is mandatory"
      />,
    );

    expect(screen.getByText('Selection is mandatory')).toBeInTheDocument();
  });
});
