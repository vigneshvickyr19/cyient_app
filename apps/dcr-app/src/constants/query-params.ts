export const QUERY_PARAMS = {
  PAGE: 'page',
  PAGE_SIZE: 'pageSize',
  SORT: 'sort',
  DESC: 'desc',
  TAB: 'tab',
  SCOPE: 'scope',
  SEARCH: 'search',
  STATUS: 'status',
  RELEASED: 'released',
  LOCATION: 'location',
  DEPARTMENT: 'department',
  REASON: 'reason',
  FROM: 'from',
  TO: 'to',
  STAGE: 'stage',
  MIN_DAYS: 'minDays',
} as const;

export type QueryParamKey = (typeof QUERY_PARAMS)[keyof typeof QUERY_PARAMS];
