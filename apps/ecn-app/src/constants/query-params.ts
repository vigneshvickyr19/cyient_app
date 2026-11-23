export const QUERY_PARAMS = {
  PAGE: 'page',
  PAGE_SIZE: 'pageSize',
  SORT: 'sort',
  DESC: 'desc',
  TAB: 'tab',
  TYPE: 'type',
  SEARCH: 'search',
  CUSTOMER: 'customer',
  STATUS: 'status',
  KIND: 'kind',
  CATEGORY_1: 'category1',
  CATEGORY_2: 'category2',
  INITIATOR: 'initiator',
  INITIATOR_NAME: 'initiatorName',
  FROM: 'from',
  TO: 'to',
  STAGE: 'stage',
  MIN_DAYS: 'minDays',
} as const;

export type QueryParamKey = (typeof QUERY_PARAMS)[keyof typeof QUERY_PARAMS];
