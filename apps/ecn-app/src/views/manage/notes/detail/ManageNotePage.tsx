import type { OpenTaskItem } from '@cyient/api-client/ecn';
import {
  Button,
  ConfirmDialog,
  ErrorState,
  errorMessage,
  LinkButton,
  PageHeader,
  PageLoader,
  RecordHistoryTabs,
  SectionSkeleton,
  SimpleTable,
  StatusChip,
  useAuth,
  useTabState,
} from '@cyient/shared-ui';
import { daysSince, formatDateTime } from '@cyient/shared-utils';
import { useState } from 'react';
import { useParams } from 'react-router';
import { permissions } from '@/constants/permissions';
import { useNote } from '@/hooks/notes/queries';
import { stageLabel, STATUS_ACTIONS, statusInfo, typeLabels } from '@/constants/note-status';
import { DEFAULT_RECORD_HISTORY_TAB, RECORD_HISTORY_TABS, type RecordHistoryTab } from '@/constants/tab-sections';
import { useCancelNote, useNoteRecord, useOpenTasks } from '@/hooks/manage/queries';

function TasksTab({ publicId }: { publicId: string }) {
  const tasks = useOpenTasks({ PublicId: publicId, PageSize: 100 });
  if (tasks.isPending) return <SectionSkeleton />;
  if (tasks.isError) return <ErrorState message={errorMessage(tasks.error)} onRetry={() => void tasks.refetch()} />;
  return (
    <SimpleTable<OpenTaskItem>
      aria-label="Open tasks"
      rows={tasks.data.data}
      getRowKey={(row) => row.taskId}
      columns={[
        { key: 'stage', header: 'Stage', render: (row) => stageLabel(row.stage) },
        { key: 'with', header: 'With', render: (row) => row.assigneeUser?.name ?? row.assigneeRole?.name ?? '—' },
        { key: 'since', header: 'Since', render: (row) => formatDateTime(row.assignedAt), width: 170 },
        { key: 'days', header: 'Days', render: (row) => daysSince(row.assignedAt), width: 80 },
        { key: 'reminder', header: 'Last reminder', render: (row) => formatDateTime(row.lastReminderAt) || '—', width: 170 },
      ]}
      emptyTitle="No open tasks"
    />
  );
}

/** One note for administrators: cancel it with a reason, and see its history, emails, audit trail and open tasks. */
export function ManageNotePage() {
  const { publicId = '' } = useParams();
  const { can } = useAuth();
  const { activeTab: tab, setTab } = useTabState<RecordHistoryTab>({
    defaultTab: DEFAULT_RECORD_HISTORY_TAB,
    validTabs: RECORD_HISTORY_TABS,
  });
  const note = useNote(publicId);
  const cancel = useCancelNote(publicId);
  const record = useNoteRecord(publicId);
  const [cancelling, setCancelling] = useState(false);

  if (note.isPending) return <PageLoader />;
  if (note.isError) return <ErrorState message={errorMessage(note.error)} onRetry={() => void note.refetch()} />;

  const details = note.data;
  const title = `${typeLabels[details.noteType]} ${details.noteNo}`;
  const cancellable = details.status !== STATUS_ACTIONS.RELEASED && details.status !== STATUS_ACTIONS.CANCELLED;

  return (
    <>
      <PageHeader
        title={title}
        subtitle={`${details.productNumber} · ${details.customer.name ?? ''}`}
        breadcrumbs={[{ label: 'All notes (administration)', to: '/manage/notes' }, { label: title }]}
        backTo="/manage/notes"
        status={<StatusChip {...statusInfo[details.status]} />}
        actions={
          <>
            <LinkButton to={`/notes/${publicId}`}>Open note</LinkButton>
            {can(permissions.adminRequests) && cancellable && (
              <Button color="error" variant="outlined" onClick={() => { setCancelling(true); }}>
                Cancel note
              </Button>
            )}
          </>
        }
      />
      <RecordHistoryTabs
        {...record}
        formatStage={stageLabel}
        tab={tab}
        onTabChange={setTab}
        extraTabs={[{ value: 'tasks', label: 'Open tasks', anyOf: [permissions.manageTasks], content: <TasksTab publicId={publicId} /> }]}
      />

      <ConfirmDialog
        open={cancelling}
        title={`Cancel ${title}?`}
        message="Open tasks close and the initiator is emailed. The reason is shown on the note's Log. This can't be undone."
        confirmLabel="Cancel note"
        cancelLabel="Keep it"
        danger
        comment="required"
        commentLabel="Reason"
        loading={cancel.isPending}
        onClose={() => { setCancelling(false); }}
        onConfirm={(reason) => {
          cancel.mutate({ reason, version: details.version }, { onSuccess: () => { setCancelling(false); } });
        }}
      />
    </>
  );
}
