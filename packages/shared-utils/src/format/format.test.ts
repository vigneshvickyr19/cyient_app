import { describe, expect, it } from 'vitest';
import { formatCurrency, formatFileSize, formatNumber, humanize, initials, numberOrNull, textOrNull } from './format';

describe('format', () => {
  it('humanizes enum names and phrases', () => {
    expect(humanize('DeptManagerReview')).toBe('Dept Manager Review');
    expect(humanize('MPPL_CLOSED')).toBe('Mppl Closed');
    expect(humanize('')).toBe('');
    expect(humanize(null)).toBe('');
  });

  it('formats file sizes in human units', () => {
    expect(formatFileSize(500)).toBe('500 bytes');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(10_485_760)).toBe('10 MB');
    expect(formatFileSize(NaN)).toBe('');
  });

  it('formats numbers with Indian grouping and currencies', () => {
    expect(formatNumber(1234567.5)).toBe('12,34,567.5');
    expect(formatNumber(null)).toBe('');
    // Currency spacing and non-breaking spaces can vary slightly by ICU version; check core components
    expect(formatCurrency(50000, 'INR')).toMatch(/50,000/);
    expect(formatCurrency(null, 'INR')).toBe('');
  });

  it('picks initials for an avatar', () => {
    expect(initials('Riya Requester')).toBe('RR');
    expect(initials('Single')).toBe('SI');
    expect(initials('')).toBe('?');
  });

  it('converts blank text and numbers to null', () => {
    expect(textOrNull('   ')).toBeNull();
    expect(textOrNull('  a  ')).toBe('a');
    expect(numberOrNull('   ')).toBeNull();
    expect(numberOrNull('42')).toBe(42);
  });
});
