import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CustomSelect, type Option } from './index';

const sampleOptions: Option<number>[] = [
  { value: 1, label: 'Option One' },
  { value: 2, label: 'Option Two' },
  { value: 3, label: 'Disabled Option', disabled: true },
];

describe('CustomSelect', () => {
  it('renders label and empty placeholder', () => {
    render(
      <CustomSelect
        label="Department"
        value={null}
        onChange={vi.fn()}
        options={sampleOptions}
        emptyLabel="Choose a department"
        required
      />,
    );

    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('Choose a department')).toBeInTheDocument();
  });

  it('selects an option and preserves number type', async () => {
    const onChange = vi.fn();
    render(
      <CustomSelect
        label="Category"
        value={null}
        onChange={onChange}
        options={sampleOptions}
        emptyLabel="Select"
      />,
    );

    const combobox = screen.getByRole('combobox');
    await userEvent.click(combobox);

    const option = await screen.findByRole('option', { name: 'Option Two' });
    await userEvent.click(option);

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('shows error state and message', () => {
    render(
      <CustomSelect
        label="Role"
        value={null}
        onChange={vi.fn()}
        options={sampleOptions}
        error="Role is required"
      />,
    );

    expect(screen.getByText('Role is required')).toBeInTheDocument();
  });

  it('handles clearing selection to null', async () => {
    const onChange = vi.fn();
    render(
      <CustomSelect
        label="Category"
        value={1}
        onChange={onChange}
        options={sampleOptions}
        emptyLabel="None"
      />,
    );

    const combobox = screen.getByRole('combobox');
    await userEvent.click(combobox);

    const emptyOption = await screen.findByRole('option', { name: 'None' });
    await userEvent.click(emptyOption);

    expect(onChange).toHaveBeenCalledWith(null);
  });
});
