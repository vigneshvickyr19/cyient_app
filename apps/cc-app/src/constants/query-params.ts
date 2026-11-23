export const QUERY_PARAMS = {
  PAGE: 'page',
  PAGE_SIZE: 'pageSize',
  SORT: 'sort',
  DESC: 'desc',
  TAB: 'tab',
  SCOPE: 'scope',
  SEARCH: 'search',
  STATUS: 'status',
  CUSTOMER: 'customer',
  CRITICAL: 'critical',
  INITIATOR: 'initiator',
  INITIATOR_NAME: 'initiatorName',
  FROM: 'from',
  TO: 'to',
  YEAR: 'year',
} as const;

export type QueryParamKey = (typeof QUERY_PARAMS)[keyof typeof QUERY_PARAMS];
