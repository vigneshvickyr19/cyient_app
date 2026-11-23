/** Administration record history tabs for ECN/TCN notes including open tasks. */
export const RECORD_HISTORY_TABS = ['history', 'emails', 'audit', 'tasks'] as const;
export type RecordHistoryTab = (typeof RECORD_HISTORY_TABS)[number];
export const DEFAULT_RECORD_HISTORY_TAB: RecordHistoryTab = 'history';

/** Fixed tabs for note detail views. */
export const NOTE_DETAIL_FIXED_TABS = [
  'front',
  'team',
  'parts',
  'immediate',
  'attendance',
  'attachments',
  'log',
] as const;
export type NoteDetailFixedTab = (typeof NOTE_DETAIL_FIXED_TABS)[number];
export const DEFAULT_NOTE_DETAIL_TAB: NoteDetailFixedTab = 'front';

/** Prefix for dynamic CFT function tabs. */
export const FUNCTION_TAB_PREFIX = 'function-' as const;

/** Note list filter tabs. */
export const NOTE_LIST_TABS = ['Both', 'Ecn', 'Tcn'] as const;
export type NoteListTab = (typeof NOTE_LIST_TABS)[number];
export const DEFAULT_NOTE_LIST_TAB: NoteListTab = 'Both';
