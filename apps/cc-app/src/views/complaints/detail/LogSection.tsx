import {
  ActivityLog,
  errorMessage,
  ErrorState,
  SectionCard,
  SectionSkeleton,
} from '@cyient/shared-ui';
import { useComplaintLog } from '@/hooks/complaints/queries';

export interface LogSectionProps {
  publicId: string;
}

export function LogSection({ publicId }: LogSectionProps) {
  const log = useComplaintLog(publicId);
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
