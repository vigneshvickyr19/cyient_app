import type { CftTeamRow, NoteDetails } from '@cyient/api-client/ecn';
import type { ReactNode } from 'react';
import { AttachmentsSection } from '@/views/notes/detail/AttachmentsSection';
import { AttendanceSection } from '@/views/notes/detail/AttendanceSection';
import { CftTeamSection } from '@/views/notes/detail/CftTeamSection';
import { FrontPage } from '@/views/notes/detail/FrontPage';
import { FunctionTab } from '@/views/notes/detail/FunctionTab';
import { ImmediateActionsSection, PartsSection } from '@/views/notes/detail/LinesSection';
import { LogSection } from '@/views/notes/detail/LogSection';
import { isOpenAction } from './note-status';

/** Administration record history tabs for ECN/TCN notes including open tasks. */
export const RECORD_HISTORY_SECTIONS = {
  HISTORY: 'history',
  EMAILS: 'emails',
  AUDIT: 'audit',
  TASKS: 'tasks',
} as const;

export const RECORD_HISTORY_TABS = [
  RECORD_HISTORY_SECTIONS.HISTORY,
  RECORD_HISTORY_SECTIONS.EMAILS,
  RECORD_HISTORY_SECTIONS.AUDIT,
  RECORD_HISTORY_SECTIONS.TASKS,
] as const;

export type RecordHistoryTab = (typeof RECORD_HISTORY_TABS)[number];
export const DEFAULT_RECORD_HISTORY_TAB: RecordHistoryTab = RECORD_HISTORY_SECTIONS.HISTORY;

/** Fixed tabs for note detail views. */
export const NOTE_DETAIL_SECTIONS = {
  FRONT: 'front',
  TEAM: 'team',
  PARTS: 'parts',
  IMMEDIATE: 'immediate',
  ATTENDANCE: 'attendance',
  ATTACHMENTS: 'attachments',
  LOG: 'log',
} as const;

export const NOTE_DETAIL_FIXED_TABS = [
  NOTE_DETAIL_SECTIONS.FRONT,
  NOTE_DETAIL_SECTIONS.TEAM,
  NOTE_DETAIL_SECTIONS.PARTS,
  NOTE_DETAIL_SECTIONS.IMMEDIATE,
  NOTE_DETAIL_SECTIONS.ATTENDANCE,
  NOTE_DETAIL_SECTIONS.ATTACHMENTS,
  NOTE_DETAIL_SECTIONS.LOG,
] as const;

export type NoteDetailFixedTab = (typeof NOTE_DETAIL_FIXED_TABS)[number];
export const DEFAULT_NOTE_DETAIL_TAB: NoteDetailFixedTab = NOTE_DETAIL_SECTIONS.FRONT;

/** Prefix for dynamic CFT function tabs. */
export const FUNCTION_TAB_PREFIX = 'function-' as const;

/** Note list filter tabs. */
export const NOTE_LIST_TABS = ['Both', 'Ecn', 'Tcn'] as const;
export type NoteListTab = (typeof NOTE_LIST_TABS)[number];
export const DEFAULT_NOTE_LIST_TAB: NoteListTab = 'Both';

/** Context passed to note detail tab components and label resolvers. */
export interface NoteDetailContext {
  note: NoteDetails;
  publicId: string;
  showAttendance: boolean;
  functionTabs: readonly CftTeamRow[];
  shownFunction?: CftTeamRow;
}

/** Definition for each tab item rendered in the tab bar. */
export interface NoteTabItem {
  key: string;
  label: string;
}

/** Component mapping for every fixed note detail tab. */
export const NOTE_DETAIL_TAB_COMPONENTS: Record<
  NoteDetailFixedTab,
  (context: NoteDetailContext) => ReactNode
> = {
  front: ({ note }) => <FrontPage note={note} />,
  team: ({ note }) => <CftTeamSection note={note} />,
  parts: ({ note }) => <PartsSection note={note} />,
  immediate: ({ note }) => <ImmediateActionsSection note={note} />,
  attendance: ({ note }) => <AttendanceSection key={note.version} note={note} />,
  attachments: ({ note }) => <AttachmentsSection note={note} />,
  log: ({ publicId }) => <LogSection publicId={publicId} />,
};

/**
 * Returns the full ordered list of tabs (including fixed tabs and dynamic CFT function tabs)
 * for the given note context.
 */
export function getNoteDetailTabs(context: NoteDetailContext): readonly NoteTabItem[] {
  const { note, showAttendance, functionTabs } = context;
  const items: NoteTabItem[] = [
    { key: NOTE_DETAIL_SECTIONS.FRONT, label: 'Front page' },
    { key: NOTE_DETAIL_SECTIONS.TEAM, label: 'CFT team' },
    { key: NOTE_DETAIL_SECTIONS.PARTS, label: `ECN parts (${note.parts.length})` },
    { key: NOTE_DETAIL_SECTIONS.IMMEDIATE, label: `Immediate actions (${note.immediateActions.length})` },
  ];

  if (showAttendance) {
    items.push({ key: NOTE_DETAIL_SECTIONS.ATTENDANCE, label: 'Attendance' });
  }

  for (const row of functionTabs) {
    const open = row.actions.filter((a) => isOpenAction(a.status)).length;
    items.push({
      key: `${FUNCTION_TAB_PREFIX}${row.functionId}`,
      label: open > 0 ? `${row.functionName} (${open} open)` : row.functionName,
    });
  }

  items.push(
    {
      key: NOTE_DETAIL_SECTIONS.ATTACHMENTS,
      label: `Attachments${note.attachments?.length ? ` (${note.attachments.length})` : ''}`,
    },
    { key: NOTE_DETAIL_SECTIONS.LOG, label: 'Log' },
  );

  return items;
}

/** Dynamically renders the active tab component based on configuration. */
export function renderNoteDetailTab(activeTab: string, context: NoteDetailContext): ReactNode {
  if (activeTab.startsWith(FUNCTION_TAB_PREFIX) && context.shownFunction) {
    return <FunctionTab note={context.note} row={context.shownFunction} />;
  }
  const renderer = NOTE_DETAIL_TAB_COMPONENTS[activeTab as NoteDetailFixedTab];
  return renderer ? renderer(context) : null;
}
