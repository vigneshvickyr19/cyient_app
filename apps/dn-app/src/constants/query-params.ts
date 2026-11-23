export const QUERY_PARAMS = {
  PAGE: 'page',
  PAGE_SIZE: 'pageSize',
  SORT: 'sort',
  DESC: 'desc',
  TAB: 'tab',
  SCOPE: 'scope',
  SEARCH: 'search',
  STATUS: 'status',
  CATEGORY: 'category',
  CUSTOMER: 'customer',
  UNIT: 'unit',
  DEPARTMENT: 'department',
  INITIATOR: 'initiator',
  INITIATOR_NAME: 'initiatorName',
  FROM: 'from',
  TO: 'to',
  ASSIGNEE: 'assignee',
  ASSIGNEE_NAME: 'assigneeName',
  MIN_DAYS: 'minDays',
} as const;

export type QueryParamKey = (typeof QUERY_PARAMS)[keyof typeof QUERY_PARAMS];
