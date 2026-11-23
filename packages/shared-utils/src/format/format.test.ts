import { describe, expect, it } from 'vitest';
import {
  EMPTY_CELL_FALLBACK,
  formatCellValue,
  formatCurrency,
  formatFileSize,
  formatNumber,
  humanize,
  initials,
  isCellEmpty,
  numberOrNull,
  textOrNull,
} from './format';

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

  it('formats cell values with standard fallback -- for null, undefined, and empty values', () => {
    expect(EMPTY_CELL_FALLBACK).toBe('--');
    expect(isCellEmpty(null)).toBe(true);
    expect(isCellEmpty(undefined)).toBe(true);
    expect(isCellEmpty('')).toBe(true);
    expect(isCellEmpty('   ')).toBe(true);
    expect(isCellEmpty('null')).toBe(true);
    expect(isCellEmpty('undefined')).toBe(true);
    expect(isCellEmpty('-')).toBe(true);
    expect(isCellEmpty(NaN)).toBe(true);
    expect(isCellEmpty([])).toBe(true);

    expect(isCellEmpty('Valid text')).toBe(false);
    expect(isCellEmpty(0)).toBe(false);
    expect(isCellEmpty(false)).toBe(false);
    expect(isCellEmpty([1])).toBe(false);

    expect(formatCellValue(null)).toBe('--');
    expect(formatCellValue(undefined)).toBe('--');
    expect(formatCellValue('')).toBe('--');
    expect(formatCellValue('   ')).toBe('--');
    expect(formatCellValue('null')).toBe('--');
    expect(formatCellValue('undefined')).toBe('--');
    expect(formatCellValue('ICC/2026/0001')).toBe('ICC/2026/0001');
    expect(formatCellValue(0)).toBe('0');
    expect(formatCellValue(13)).toBe('13');
  });
});
