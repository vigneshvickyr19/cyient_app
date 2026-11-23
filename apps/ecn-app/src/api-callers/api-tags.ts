import type { NoteListQuery, TaskQuery } from '@/types/notes';

/**
 * The TanStack Query keys (tags) of the ECN app, by model. Fetching, caching, invalidating and every mutation use these
 * and nothing else, so one change refreshes exactly what it should. Each model's `all` is the prefix of its other keys:
 * invalidating `all` refreshes the lists, the details and the rest of that model.
 */

const note = {
  all: ['ecn', 'notes'] as const,
  lists: () => [...note.all, 'list'] as const,
  list: (query: NoteListQuery) => [...note.lists(), query] as const,
  pendingAll: () => [...note.all, 'pending'] as const,
  pending: (page: number, pageSize: number) => [...note.pendingAll(), page, pageSize] as const,
  detail: (publicId: string) => [...note.all, 'detail', publicId] as const,
  log: (publicId: string) => [...note.detail(publicId), 'log'] as const,
  attachmentsAll: (publicId: string) => [...note.detail(publicId), 'attachments'] as const,
  attachments: (publicId: string, allVersions: boolean) => [...note.attachmentsAll(publicId), allVersions] as const,
};

/** The customers and the CFT functions with their predefined actions. */
const master = {
  all: ['ecn', 'masters'] as const,
  customers: (includeInactive: boolean) => [...master.all, 'customers', includeInactive] as const,
  allCustomers: () => [...master.all, 'customers'] as const,
  functions: () => [...master.all, 'cft-functions'] as const,
  adminFunctions: () => [...master.all, 'cft-functions', 'admin'] as const,
};

const report = {
  all: ['ecn', 'report'] as const,
  open: (customerId: number | undefined) => [...report.all, 'open', customerId ?? 'all'] as const,
};

const manage = {
  all: ['ecn', 'manage'] as const,
  tasks: (query: TaskQuery) => [...manage.all, 'tasks', query] as const,
  record: (publicId: string) => [...manage.all, 'record', publicId] as const,
};

export const ecnTags = { note, master, report, manage } as const;
