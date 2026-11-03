import { useSearchParams } from 'react-router';

/** A list's filters: each an optional string, as in the address (for example `interface Filters { status?: string }`). */
export type FilterValues<F> = Partial<Record<keyof F, string>>;

/** A number filter from the address (`?location=3`); undefined when it is not set. */
export const toNumber = (value: string | undefined): number | undefined => (value ? Number(value) : undefined);

export interface ListState<F extends FilterValues<F>> {
  /** 1-based, as the API expects. */
  page: number;
  pageSize: number;
  sort: { field: string; descending: boolean } | null;
  filters: F;
  /** Whether any filter is set. */
  filtered: boolean;
  setPage: (page: number, pageSize?: number) => void;
  setSort: (sort: { field: string; descending: boolean } | null) => void;
  /** Changes some filters and goes back to the first page. */
  setFilters: (changes: Partial<F>) => void;
  clearFilters: () => void;
}

/**
 * A list's page, sort and filters, kept in the address so a filtered list can be bookmarked, shared and returned to
 * with the back button. Filter values are strings, as in the address; pages map them to the API's query.
 */
export function useListState<F extends FilterValues<F>>(filterNames: readonly (keyof F & string)[], defaults: { pageSize?: number } = {}): ListState<F> {
  const [params, setParams] = useSearchParams();
  const defaultPageSize = defaults.pageSize ?? 20;

  const page = Math.max(1, Number(params.get('page')) || 1);
  const pageSize = Number(params.get('pageSize')) || defaultPageSize;
  const sortField = params.get('sort');
  const sort = sortField ? { field: sortField, descending: params.get('desc') === 'true' } : null;
  const filters = Object.fromEntries(filterNames.map((name) => [name, params.get(name) ?? undefined])) as F;

  const update = (change: (next: URLSearchParams) => void) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        change(next);
        return next;
      },
      { replace: true },
    );
  };

  return {
    page,
    pageSize,
    sort,
    filters,
    filtered: filterNames.some((name) => Boolean(filters[name])),
    setPage: (nextPage, nextPageSize) => {
      update((next) => {
        next.set('page', String(nextPage));
        if (nextPageSize && nextPageSize !== defaultPageSize) next.set('pageSize', String(nextPageSize));
        else if (nextPageSize) next.delete('pageSize');
      });
    },
    setSort: (nextSort) => {
      update((next) => {
        if (nextSort) {
          next.set('sort', nextSort.field);
          next.set('desc', String(nextSort.descending));
        } else {
          next.delete('sort');
          next.delete('desc');
        }
      });
    },
    setFilters: (changes) => {
      update((next) => {
        for (const [name, value] of Object.entries(changes)) {
          if (typeof value === 'string' && value !== '') next.set(name, value);
          else next.delete(name);
        }
        next.delete('page');
      });
    },
    clearFilters: () => {
      update((next) => {
        for (const name of filterNames) next.delete(name);
        next.delete('page');
      });
    },
  };
}
