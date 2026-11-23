import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CustomInput, CustomTextArea } from './index';

describe('CustomInput', () => {
  it('renders with label and helper text', () => {
    render(
      <CustomInput
        label="Username"
        value=""
        onChange={vi.fn()}
        helperText="Enter your corporate username"
        required
      />,
    );

    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('Enter your corporate username')).toBeInTheDocument();
  });

  it('calls onChange when user types', async () => {
    const onChange = vi.fn();
    render(<CustomInput label="Email" value="" onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: /email/i });
    await userEvent.type(input, 'test@example.com');

    expect(onChange).toHaveBeenCalled();
  });

  it('displays error message and applies error state', () => {
    render(
      <CustomInput
        label="Password"
        value="123"
        onChange={vi.fn()}
        error="Password too short"
      />,
    );

    expect(screen.getByText('Password too short')).toBeInTheDocument();
  });

  it('clears value when clearable button is clicked', async () => {
    const onChange = vi.fn();
    render(
      <CustomInput
        label="Search"
        value="query"
        onChange={onChange}
        clearable
      />,
    );

    const clearButton = screen.getByRole('button', { name: /clear input/i });
    await userEvent.click(clearButton);

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('toggles password visibility', async () => {
    render(
      <CustomInput
        label="Password"
        value="secret"
        onChange={vi.fn()}
        type="password"
      />,
    );

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    await userEvent.click(toggleButton);

    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
  });

  it('renders CustomTextArea with multiline attribute', () => {
    render(
      <CustomTextArea
        label="Description"
        value="Some multi-line content"
        onChange={vi.fn()}
        minRows={4}
      />,
    );

    const textarea = screen.getByRole('textbox', { name: /description/i });
    expect(textarea).toBeInTheDocument();
  });
});
