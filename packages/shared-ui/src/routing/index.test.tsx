import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import { lazyNamed, toRelativePath } from './index';

describe('routing helpers', () => {
  it('writes a route as a path relative to its parent', () => {
    expect(toRelativePath('/requests/:publicId')).toBe('requests/:publicId');
    expect(toRelativePath('*')).toBe('*');
  });

  it('loads a page from the module that exports it by name', async () => {
    const Page = lazyNamed(() => Promise.resolve({ RequestsPage: () => <h1>Requests</h1> }), 'RequestsPage');

    render(
      <Suspense fallback="Loading">
        <Page />
      </Suspense>,
    );

    expect(await screen.findByRole('heading', { name: 'Requests' })).toBeInTheDocument();
  });
});
