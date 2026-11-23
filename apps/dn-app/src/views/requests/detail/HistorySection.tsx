import {
  ActivityLog,
  errorMessage,
  ErrorState,
  SectionCard,
  SectionSkeleton,
} from '@cyient/shared-ui';
import { useRequestHistory } from '@/hooks/requests/queries';

export interface HistorySectionProps {
  publicId: string;
}

export function HistorySection({ publicId }: HistorySectionProps) {
  const history = useRequestHistory(publicId);
  if (history.isPending) return <SectionSkeleton />;
  if (history.isError) return <ErrorState message={errorMessage(history.error)} onRetry={() => void history.refetch()} />;
  return (
    <SectionCard title="History">
      <ActivityLog
        entries={history.data.map((entry) => ({
          at: entry.actionAt,
          user: entry.user.name,
          action: entry.actionName,
          stage: entry.stage,
          comment: entry.comment,
        }))}
      />
    </SectionCard>
  );
}
