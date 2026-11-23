/** A list query without its paging, so an Excel export returns every row that matches the filters. */
export function withoutPaging<Q extends object>(query: Q): Omit<Q, 'Page' | 'PageSize'> {
  return { ...query, Page: undefined, PageSize: undefined };
}
