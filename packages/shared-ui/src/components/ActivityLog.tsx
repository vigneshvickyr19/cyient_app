import { formatDateTime, humanize, initials } from '@cyient/shared-utils';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import { EmptyState } from './EmptyState';

/** One step of a record's history: who did what, at which stage, with what comment. */
export interface ActivityEntry {
  at: string;
  user: string | null;
  action: string;
  stage?: string | null;
  comment?: string | null;
}

/** The Log / History tab: workflow actions, newest first, with comments. */
export function ActivityLog({ entries, emptyMessage = 'Nothing has happened yet.' }: { entries: readonly ActivityEntry[]; emptyMessage?: string }) {
  if (entries.length === 0) return <EmptyState title="No activity" message={emptyMessage} />;
  const newestFirst = [...entries].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <Stack component="ol" spacing={0} sx={{ listStyle: 'none', m: 0, p: 0 }} aria-label="Activity">
      {newestFirst.map((entry, index) => (
        <Stack component="li" key={`${entry.at}-${index}`} direction="row" spacing={2} sx={{ pb: 2 }}>
          <Stack sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'primary.main' }}>{initials(entry.user)}</Avatar>
            {index < newestFirst.length - 1 && <Box sx={{ flex: 1, width: 2, bgcolor: 'divider', mt: 1 }} />}
          </Stack>
          <Box sx={{ minWidth: 0, pb: 1 }}>
            <Typography variant="body2">
              <strong>{entry.user ?? 'System'}</strong> · {humanize(entry.action)}
              {entry.stage ? ` · ${entry.stage}` : ''}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(entry.at)}
            </Typography>
            {entry.comment && (
              <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {entry.comment}
              </Typography>
            )}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
