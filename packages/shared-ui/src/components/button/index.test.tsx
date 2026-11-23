import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { Button, LinkButton } from './index';

describe('Button', () => {
  it('renders button with label and responds to click', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Submit</Button>);

    const button = screen.getByRole('button', { name: 'Submit' });
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when loading is true', () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
  });

  it('renders LinkButton with route link', () => {
    render(
      <MemoryRouter>
        <LinkButton to="/dashboard">Go to Dashboard</LinkButton>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: 'Go to Dashboard' });
    expect(link).toHaveAttribute('href', '/dashboard');
  });
});
