import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';
import { useListState } from '../../hooks/useListState';
import { CustomInput } from '../custom-input';
import { FilterToolbar } from './FilterToolbar';

interface Filters {
  search?: string;
  a?: string;
  b?: string;
  c?: string;
}
type Field = 'a' | 'b' | 'c';

/** A list with `fields` as its filters, and the address it keeps them in shown as text. */
function List({ fields }: { fields: Field[] }) {
  const list = useListState<Filters>(['search', 'a', 'b', 'c']);
  const { search } = useLocation();
  return (
    <>
      <FilterToolbar list={list} fields={fields} searchName="search" searchPlaceholder="Find a record">
        {(values, change) =>
          fields.map((name) => (
            <CustomInput
              key={name}
              label={name.toUpperCase()}
              value={values[name] ?? ''}
              onChange={(value) => {
                change({ [name]: value });
              }}
            />
          ))
        }
      </FilterToolbar>
      <output data-testid="address">{search}</output>
    </>
  );
}

const renderList = (fields: Field[], address = '/') =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <List fields={fields} />
    </MemoryRouter>,
  );

describe('FilterToolbar', () => {
  it('keeps up to two filters in the toolbar, and they change the list at once', async () => {
    renderList(['a', 'b']);

    expect(screen.queryByRole('button', { name: 'Filters' })).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('A'), 'x');

    expect(screen.getByTestId('address')).toHaveTextContent('?a=x');
  });

  it('puts more filters in a drawer behind a Filters button, with the search on the left', () => {
    renderList(['a', 'b', 'c']);

    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Find a record')).toBeInTheDocument();
    expect(screen.queryByLabelText('A')).not.toBeInTheDocument();
  });

  it('changes the list only when the user applies the filters, and counts them on the button', async () => {
    renderList(['a', 'b', 'c']);

    await userEvent.click(screen.getByRole('button', { name: 'Filters' }));
    const drawer = await screen.findByTestId('custom-drawer');
    expect(within(drawer).getByText('Filters')).toBeInTheDocument();
    await userEvent.type(within(drawer).getByLabelText('A'), 'one');
    await userEvent.type(within(drawer).getByLabelText('B'), 'two');
    expect(screen.getByTestId('address')).toHaveTextContent('');

    await userEvent.click(within(drawer).getByRole('button', { name: 'Apply Filters' }));

    expect(screen.getByTestId('address')).toHaveTextContent('?a=one&b=two');
    expect(await screen.findByText('2')).toBeInTheDocument();
  });

  it('forgets a draft that was never applied', async () => {
    renderList(['a', 'b', 'c']);

    await userEvent.click(screen.getByRole('button', { name: 'Filters' }));
    await userEvent.type(await screen.findByLabelText('A'), 'draft');
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    await waitFor(() => {
      expect(screen.queryByLabelText('A')).not.toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: 'Filters' }));

    expect(await screen.findByLabelText('A')).toHaveValue('');
    expect(screen.getByTestId('address')).toHaveTextContent('');
  });

  it('clears the filters but not the search', async () => {
    renderList(['a', 'b', 'c'], '/?search=pump&a=one&c=three');

    await userEvent.click(screen.getByRole('button', { name: 'Filters' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Clear Filters' }));

    expect(screen.getByTestId('address')).toHaveTextContent('?search=pump');
  });
});
