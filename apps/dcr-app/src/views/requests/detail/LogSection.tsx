import {
  ActivityLog,
  errorMessage,
  ErrorState,
  SectionCard,
  SectionSkeleton,
} from '@cyient/shared-ui';
import { useRequestLog } from '@/hooks/requests/queries';

export interface LogSectionProps {
  publicId: string;
}

export function LogSection({ publicId }: LogSectionProps) {
  const log = useRequestLog(publicId);
  if (log.isPending) return <SectionSkeleton />;
  if (log.isError) return <ErrorState message={errorMessage(log.error)} onRetry={() => void log.refetch()} />;
  return (
    <SectionCard title="Log">
      <ActivityLog
        entries={log.data.map((entry) => ({
          at: entry.actionAt,
          user: entry.user.name,
          action: entry.action,
          stage: entry.stageName,
          comment: entry.comment,
        }))}
      />
    </SectionCard>
  );
}
