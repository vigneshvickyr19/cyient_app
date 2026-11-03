import { describe, expect, it } from 'vitest';
import { businessToday, daysBetween, daysSince, formatDate, formatDateTime, isIsoDate } from './dates';

describe('business dates (India Standard Time)', () => {
  it('takes today from IST, which is ahead of UTC', () => {
    expect(businessToday(new Date('2026-11-03T18:29:00Z'))).toBe('2026-11-03');
    expect(businessToday(new Date('2026-11-03T18:31:00Z'))).toBe('2026-11-04');
  });

  it('recognises real dates only', () => {
    expect(isIsoDate('2026-02-28')).toBe(true);
    expect(isIsoDate('2026-02-30')).toBe(false);
    expect(isIsoDate('03/11/2026')).toBe(false);
  });

  it('formats a date and a UTC timestamp for people', () => {
    expect(formatDate('2026-11-03')).toBe('03 Nov 2026');
    expect(formatDate(null)).toBe('');
    expect(formatDateTime('2026-11-03T08:35:00Z')).toMatch(/^03 Nov 2026, 2:05\spm$/i);
  });

  it('counts days between dates and days waiting', () => {
    expect(daysBetween('2026-10-30', '2026-11-03')).toBe(4);
    expect(daysBetween('2026-11-03', '2026-11-01')).toBe(-2);
    expect(daysSince('2026-11-01T05:00:00Z', new Date('2026-11-03T05:00:00Z'))).toBe(2);
  });
});
