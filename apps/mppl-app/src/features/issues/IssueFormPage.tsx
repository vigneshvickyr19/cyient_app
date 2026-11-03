import { newIdempotencyKey } from '@cyient/api-client';
import { ErrorState, errorMessage, InlineAlert, PageHeader, PageLoader, useNotify } from '@cyient/shared-ui';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { IssueForm } from './IssueForm';
import { useCreateDraft, useUpdateDraft } from './mutations';
import { useIssue } from './queries';
import { issueTitle } from './status';

/** New Issue: saves a draft, then opens it to add the reference documents and submit it. */
export function NewIssuePage() {
  const navigate = useNavigate();
  const notify = useNotify();
  // One key for this form: saving again after a lost answer returns the same draft
  const [idempotencyKey] = useState(newIdempotencyKey);
  const create = useCreateDraft(idempotencyKey);

  return (
    <>
      <PageHeader
        title="New issue"
        subtitle="Save the draft, then add the reference documents (usually the supplier's email) and submit it."
        breadcrumbs={[{ label: 'Issues', to: '/issues' }, { label: 'New issue' }]}
        backTo="/issues"
      />
      <IssueForm
        saving={create.isPending}
        onCancel={() => void navigate('/issues')}
        onSave={async (input) => {
          const issue = await create.mutateAsync(input);
          notify.success('Draft saved. Add the reference documents, then submit it.');
          await navigate(`/issues/${issue.publicId}`);
        }}
      />
    </>
  );
}

/** Changes the buyer's own draft; a submitted issue is not changed. */
export function EditIssuePage() {
  const { publicId = '' } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const issue = useIssue(publicId);
  const update = useUpdateDraft(publicId);

  if (issue.isPending) return <PageLoader />;
  if (issue.isError) return <ErrorState title="This issue could not be opened" message={errorMessage(issue.error)} onRetry={() => void issue.refetch()} />;

  const details = issue.data;
  const title = issueTitle(details);

  return (
    <>
      <PageHeader
        title={`Edit ${title}`}
        breadcrumbs={[{ label: 'Issues', to: '/issues?list=Drafts' }, { label: title, to: `/issues/${publicId}` }, { label: 'Edit' }]}
        backTo={`/issues/${publicId}`}
      />
      {details.allowedActions?.canEdit ? (
        <IssueForm
          key={details.version}
          issue={details}
          saving={update.isPending}
          onCancel={() => void navigate(`/issues/${publicId}`)}
          onSave={async (input) => {
            await update.mutateAsync(input);
            notify.success('Changes saved.');
            await navigate(`/issues/${publicId}`);
          }}
        />
      ) : (
        <InlineAlert severity="warning" title="This issue can't be changed">
          Only the buyer who raised an issue can change it, and only while it is a draft. A submitted issue is not changed.
        </InlineAlert>
      )}
    </>
  );
}
