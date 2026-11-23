import { Box, Paper, Stack } from '@mui/material';
import { Children, Fragment, isValidElement, useState, type ReactNode } from 'react';
import type { FilterValues, ListState } from '../../hooks/useListState';
import { CustomDrawer } from '../custom-drawer';
import { FilterButton } from './FilterButton';
import { FilterBar, SearchField } from './index';

/** The filter inputs one by one: a fragment holds several, and a condition that is false holds none. */
function inputsOf(node: ReactNode): ReactNode[] {
  return Children.toArray(node).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment ? inputsOf(child.props.children) : [child],
  );
}

export interface FilterToolbarProps<F extends FilterValues<F>> {
  list: ListState<F>;
  /** The filters of the list (not its search): what the drawer holds, applies and clears together. */
  fields: readonly (keyof F & string)[];
  /** Kept in the address only to show a chosen person's name again; cleared with the filters but not counted. */
  helperFields?: readonly (keyof F & string)[];
  /** The search box on the left; leave out for a list that has none. */
  searchName?: keyof F & string;
  searchPlaceholder?: string;
  /**
   * The filter inputs; none for a list that is only searched. With few filters they change the list at once; in the drawer they change a draft that the list
   * takes when the user applies it, so write each input against `values` and `change`, never against the list.
   */
  children?: (values: F, change: (changes: Partial<F>) => void) => ReactNode;
  /** Buttons at the right end of the toolbar, for example Export. */
  actions?: ReactNode;
  /** More filters than this go into the drawer. */
  inlineLimit?: number;
}

/**
 * The filters of a list. Up to `inlineLimit` filters stay in the toolbar; more go into a drawer behind a Filters
 * button that shows how many are applied, so a long list of filters doesn't push the table off the screen. The search
 * box stays on the left either way.
 */
export function FilterToolbar<F extends FilterValues<F>>({
  list,
  fields,
  helperFields = [],
  searchName,
  searchPlaceholder,
  children,
  actions,
  inlineLimit = 2,
}: FilterToolbarProps<F>) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<F>(list.filters);
  const { filters } = list;

  const patch = (name: keyof F & string, value: string | undefined) => ({ [name]: value }) as unknown as Partial<F>;
  const cleared = Object.assign({}, ...fields.map((name) => patch(name, undefined))) as Partial<F>;
  const applied = fields.filter((name) => !helperFields.includes(name) && Boolean(filters[name])).length;
  const searched = searchName !== undefined && Boolean(filters[searchName]);

  const inputs = children ? inputsOf(children(filters, list.setFilters)) : [];
  const search = searchName && (
    <SearchField
      value={filters[searchName] ?? ''}
      onSearch={(value) => {
        list.setFilters(patch(searchName, value));
      }}
      placeholder={searchPlaceholder}
      label={inputs.length > inlineLimit ? null : 'Search'}
    />
  );

  if (inputs.length <= inlineLimit) {
    return (
      <FilterBar
        active={applied > 0 || searched}
        onClear={() => {
          list.setFilters(searchName ? { ...cleared, ...patch(searchName, undefined) } : cleared);
        }}
        actions={actions}
      >
        {search}
        {inputs}
      </FilterBar>
    );
  }

  const close = () => {
    setOpen(false);
  };

  return (
    <>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
          {search && <Box sx={{ flex: 1, maxWidth: { sm: 480 }, '& .MuiFormControl-root': { mb: 0 } }}>{search}</Box>}
          <Stack direction="row" spacing={1} sx={{ ml: { sm: 'auto' }, alignItems: 'center' }}>
            <FilterButton
              count={applied}
              onClick={() => {
                setDraft(filters);
                setOpen(true);
              }}
            />
            {actions}
          </Stack>
        </Stack>
      </Paper>
      <CustomDrawer
        open={open}
        onClose={close}
        title="Filters"
        applyLabel="Apply Filters"
        resetLabel="Clear Filters"
        onApply={() => {
          list.setFilters(Object.assign({}, ...fields.map((name) => patch(name, draft[name]))) as Partial<F>);
          close();
        }}
        onReset={() => {
          list.setFilters(cleared);
          close();
        }}
      >
        <Stack spacing={0.5}>
          {children?.(draft, (changes) => {
            setDraft((current) => ({ ...current, ...changes }));
          })}
        </Stack>
      </CustomDrawer>
    </>
  );
}
