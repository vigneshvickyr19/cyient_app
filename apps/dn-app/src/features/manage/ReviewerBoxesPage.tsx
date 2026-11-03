import type { ReviewerBoxDetails } from '@cyient/api-client/dn';
import {
  applyServerErrors,
  Button,
  Dropdown,
  EmptyState,
  ErrorState,
  errorMessage,
  FilterBar,
  Form,
  FormCheckbox,
  FormInput,
  Modal,
  PageHeader,
  SectionCard,
  SectionSkeleton,
  SimpleTable,
  StatusChip,
  useListState,
  useMasterOptions,
  useNotify,
  type SimpleColumn,
} from '@cyient/shared-ui';
import { maxLength, required } from '@cyient/shared-utils';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { IconButton, Stack, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useAdminReviewerBoxes, useSaveReviewerBox } from './queries';

interface BoxValues {
  sequence: string;
  name: string;
  isHeadOfDepartment: boolean;
  isMandatory: boolean;
  isActive: boolean;
}

const sequenceRule = (value: unknown) =>
  typeof value !== 'string' || value.trim() === '' || (Number.isInteger(Number(value)) && Number(value) >= 1) || 'Sequence starts at 1; the reporting manager always comes first.';

function BoxDialog({ changeCategoryId, box, nextSequence, onClose }: { changeCategoryId: number; box: ReviewerBoxDetails | null; nextSequence: number; onClose: () => void }) {
  const notify = useNotify();
  const save = useSaveReviewerBox();
  const form = useForm<BoxValues>({
    defaultValues: {
      sequence: String(box?.sequence ?? nextSequence),
      name: box?.name ?? '',
      isHeadOfDepartment: box?.isHeadOfDepartment ?? false,
      isMandatory: box?.isMandatory ?? true,
      isActive: box?.isActive ?? true,
    },
  });
  const isHead = useWatch({ control: form.control, name: 'isHeadOfDepartment' });

  const submit = (values: BoxValues) => {
    save.mutate(
      {
        id: box?.id ?? null,
        input: {
          changeCategoryId,
          sequence: Number(values.sequence),
          name: values.name.trim(),
          isHeadOfDepartment: values.isHeadOfDepartment,
          isMandatory: values.isMandatory || values.isHeadOfDepartment,
          isActive: values.isActive,
          version: box?.version ?? null,
        },
      },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!applyServerErrors(error, form)) notify.error(error);
        },
      },
    );
  };

  return (
    <Modal
      open
      title={box ? `Change ${box.name}` : 'Add a reviewer box'}
      onClose={onClose}
      busy={save.isPending}
      actions={
        <>
          <Button onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="box-form" variant="contained" loading={save.isPending}>
            {box ? 'Save' : 'Add'}
          </Button>
        </>
      }
    >
      <Form form={form} onSubmit={submit} id="box-form">
        <Stack spacing={2}>
          <FormInput<BoxValues> name="name" label="Name" autoFocus helperText="Shown on the form and as the Pending Role." rules={{ ...required('Name'), ...maxLength(50, 'Name') }} />
          <FormInput<BoxValues> name="sequence" label="Order" type="number" helperText="1 is first after the reporting manager." rules={{ ...required('Sequence'), validate: sequenceRule }} />
          <FormCheckbox<BoxValues> name="isHeadOfDepartment" label="Head of department" helperText="The last step, who answers whether further approval is required. One per category." />
          <FormCheckbox<BoxValues> name="isMandatory" label="Must be filled before submission" disabled={isHead} helperText={isHead ? 'The head of department box is always needed.' : undefined} />
          <FormCheckbox<BoxValues> name="isActive" label="Offered on new deviations" helperText="Boxes are never deleted; switch one off instead." />
        </Stack>
      </Form>
    </Modal>
  );
}

/** IT's maintenance of each change category's reviewer and approver boxes, in their order. */
export function ReviewerBoxesPage() {
  const list = useListState<{ category?: string }>(['category']);
  const categories = useMasterOptions('ChangeCategory');
  const categoryId = list.filters.category ? Number(list.filters.category) : (categories[0]?.value ?? null);
  const boxes = useAdminReviewerBoxes(categoryId);
  const [editing, setEditing] = useState<ReviewerBoxDetails | 'new' | null>(null);
  const rows = [...(boxes.data ?? [])].sort((a, b) => a.sequence - b.sequence);
  const categoryName = categories.find((option) => option.value === categoryId)?.label ?? 'this category';

  const columns: SimpleColumn<ReviewerBoxDetails>[] = [
    { key: 'sequence', header: 'Order', width: 72, render: (row) => row.sequence },
    { key: 'name', header: 'Name', render: (row) => row.name },
    { key: 'head', header: 'Head of department', render: (row) => (row.isHeadOfDepartment ? 'Yes' : '—') },
    { key: 'mandatory', header: 'Must be filled', render: (row) => (row.isMandatory ? 'Yes' : 'No') },
    { key: 'state', header: 'State', render: (row) => <StatusChip label={row.isActive ? 'Active' : 'Switched off'} tone={row.isActive ? 'success' : 'neutral'} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: 80,
      render: (row) => (
        <Tooltip title="Change">
          <IconButton aria-label={`Change ${row.name}`} onClick={() => { setEditing(row); }}>
            <EditOutlinedIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Reviewer boxes" subtitle="The reviewers and approvers each change category goes through, after the reporting manager" />
      <FilterBar>
        <Dropdown label="Change category" options={categories} value={categoryId} onChange={(id) => { list.setFilters({ category: id?.toString() }); }} />
      </FilterBar>

      {categoryId === null ? (
        <EmptyState title="No change categories" message="Add change categories under Administration › Master lists first." />
      ) : boxes.isPending ? (
        <SectionSkeleton />
      ) : boxes.isError ? (
        <ErrorState message={errorMessage(boxes.error)} onRetry={() => void boxes.refetch()} />
      ) : (
        <SectionCard
          title={categoryName}
          subheader="A deviation already submitted keeps its own steps."
          flush
          actions={
            <Button startIcon={<AddIcon />} onClick={() => { setEditing('new'); }}>
              Add box
            </Button>
          }
        >
          <SimpleTable<ReviewerBoxDetails>
            aria-label={`Reviewer boxes of ${categoryName}`}
            rows={rows}
            columns={columns}
            getRowKey={(row) => row.id}
            emptyTitle="No boxes yet"
            emptyMessage="Deviations of this category can't be submitted until it has its boxes, the head of department last."
          />
        </SectionCard>
      )}

      {editing && categoryId !== null && (
        <BoxDialog
          changeCategoryId={categoryId}
          box={editing === 'new' ? null : editing}
          nextSequence={Math.max(0, ...rows.map((row) => row.sequence)) + 1}
          onClose={() => {
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
