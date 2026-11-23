import { describe, expect, it } from 'vitest';
import { buildUrl } from './http';
import { withoutPaging } from './query';

describe('withoutPaging', () => {
  it('drops Page and PageSize but keeps the filters', () => {
    const query = withoutPaging({ Search: 'gear', Status: 'Draft', Page: 3, PageSize: 20 });

    expect(buildUrl('http://api', '/api/v1/requests/export', { query })).toBe('http://api/api/v1/requests/export?Search=gear&Status=Draft');
  });
});
