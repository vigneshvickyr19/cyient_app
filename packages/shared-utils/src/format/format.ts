const LOCALE = 'en-IN';

/** An enum value from the API for people: DeptManagerReview becomes "Dept Manager Review", MPPL_CLOSED "Mppl Closed". */
export function humanize(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** 1536 becomes "1.5 KB". */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  const units = ['bytes', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return unit === 0 ? `${size} ${units[0]}` : `${size.toFixed(size < 10 ? 1 : 0)} ${units[unit]}`;
}

/** Indian digit grouping: 1234567.5 becomes "12,34,567.5". */
export function formatNumber(value: number | null | undefined, fractionDigits = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '';
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: fractionDigits }).format(value);
}

/** An amount in its currency (INR, USD...); an unknown code falls back to the number and the code. */
export function formatCurrency(value: number | null | undefined, currency: string | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '';
  if (!currency) return formatNumber(value);
  try {
    return new Intl.NumberFormat(LOCALE, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${formatNumber(value)} ${currency}`;
  }
}

/** Up to two initials for an avatar: "Riya Requester" becomes "RR". */
export function initials(name: string | null | undefined): string {
  if (!name) return '?';
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? `${words[0]?.[0] ?? ''}${words.at(-1)?.[0] ?? ''}` : (words[0]?.slice(0, 2) ?? '?')).toUpperCase();
}

/** Text with its ends trimmed, or null when there is none (the APIs store blanks as null). */
export const textOrNull = (value: string): string | null => value.trim() || null;

/** A number typed into a field, or null when it is empty. */
export const numberOrNull = (value: string): number | null => (value.trim() === '' ? null : Number(value));

/** Standard fallback string for empty, null, or undefined table cells. */
export const EMPTY_CELL_FALLBACK = '--';

/**
 * Checks whether a value is considered empty, null, undefined, or unavailable.
 */
export function isCellEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return (
      trimmed === '' ||
      trimmed.toLowerCase() === 'null' ||
      trimmed.toLowerCase() === 'undefined' ||
      trimmed === '-'
    );
  }
  if (typeof value === 'number') {
    return Number.isNaN(value);
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return false;
}

/**
 * Formats a value for display in table cells.
 * Returns '--' whenever a value is null, undefined, empty, or unavailable instead of showing blank spaces.
 */
export function formatCellValue(value: unknown, fallback: string = EMPTY_CELL_FALLBACK): string {
  if (isCellEmpty(value)) {
    return fallback;
  }
  return String(value);
}
