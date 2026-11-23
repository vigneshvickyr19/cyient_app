import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { useTabState } from './useTabState';

const TEST_TABS = ['details', 'clauses', 'documents', 'log'] as const;
type TestTab = (typeof TEST_TABS)[number];

function TabTestComponent() {
  const { activeTab, setTab } = useTabState<TestTab>({
    defaultTab: 'details',
    validTabs: TEST_TABS,
  });

  return (
    <div>
      <span data-testid="active-tab">{activeTab}</span>
      <button type="button" onClick={() => { setTab('clauses'); }}>
        Select Clauses
      </button>
      <button type="button" onClick={() => { setTab('details'); }}>
        Select Details
      </button>
    </div>
  );
}

describe('useTabState', () => {
  it('defaults to defaultTab when no tab param is in URL', () => {
    render(
      <MemoryRouter initialEntries={['/test']}>
        <TabTestComponent />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('active-tab').textContent).toBe('details');
  });

  it('reads active tab from URL search parameters', () => {
    render(
      <MemoryRouter initialEntries={['/test?tab=clauses']}>
        <TabTestComponent />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('active-tab').textContent).toBe('clauses');
  });

  it('gracefully falls back to defaultTab when an invalid tab is in URL', () => {
    render(
      <MemoryRouter initialEntries={['/test?tab=nonexistent']}>
        <TabTestComponent />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('active-tab').textContent).toBe('details');
  });

  it('updates tab when setTab is called', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/test']}>
        <TabTestComponent />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('active-tab').textContent).toBe('details');
    await user.click(screen.getByRole('button', { name: 'Select Clauses' }));
    expect(screen.getByTestId('active-tab').textContent).toBe('clauses');
    await user.click(screen.getByRole('button', { name: 'Select Details' }));
    expect(screen.getByTestId('active-tab').textContent).toBe('details');
  });
});
