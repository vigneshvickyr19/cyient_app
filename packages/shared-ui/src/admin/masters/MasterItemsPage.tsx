import type { MasterItemDetails } from '@cyient/api-client/platform';
import { humanize, maxLength, notBlank, required, wholeNumber } from '@cyient/shared-utils';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { IconButton, Button as MuiButton, Stack, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { Button } from '../../components/Button';
import { InlineAlert, SectionCard } from '../../components/display';
import { ErrorState } from '../../components/ErrorState';
import { SectionSkeleton } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { SimpleTable, type SimpleColumn } from '../../components/SimpleTable';
import { errorMessage } from '../../errors/errorMessage';
import { FormCheckbox, FormInput } from '../../form/fields';
import { applyServerErrors, Form } from '../../form/Form';
import { useNotify } from '../../notifications/NotificationProvider';
import { useAdminPath } from '../shared/AdminBase';
import { ActiveChip } from '../shared/chips';
import { CONFLICT_MESSAGE, isConflict } from '../shared/feedback';
import { useAdminMasterItems, useMasterTypes, useSaveMasterItem } from './queries';

/** The items of one master list, switched-off ones included, with adding and changing them. */
export default function MasterItemsPage() {
  const masterType = useParams().masterType ?? '';
  const items = useAdminMasterItems(masterType);
  const types = useMasterTypes();
  const adminPath = useAdminPath();
  // null: closed; 'new': adding; an item: changing it
  const [editing, setEditing] = useState<MasterItemDetails | 'new' | null>(null);
  const title = types.data?.find((type) => type.type === masterType)?.name ?? humanize(masterType);

  const columns: readonly SimpleColumn<MasterItemDetails>[] = [
    { key: 'code', header: 'Code', render: (item) => item.code },
    { key: 'name', header: 'Name', render: (item) => item.name },
    { key: 'sortOrder', header: 'Sort order', align: 'right', render: (item) => item.sortOrder },
    { key: 'status', header: 'Status', render: (item) => <ActiveChip active={item.isActive} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <Tooltip title="Change">
          <IconButton
            aria-label={`Change ${item.name}`}
            onClick={() => {
              setEditing(item);
            }}
          >
            <EditOutlinedIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={title}
        subtitle="Switched-off items are no longer offered in drop-downs; items are never deleted."
        backTo={adminPath('masters')}
        breadcrumbs={[{ label: 'Master lists', to: adminPath('masters') }, { label: title }]}
        actions={
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            disabled={!items.data}
            onClick={() => {
              setEditing('new');
            }}
          >
            Add item
          </Button>
        }
      />
      <SectionCard title="Items" flush>
        {items.isPending ? (
          <Stack sx={{ p: 2 }}>
            <SectionSkeleton />
          </Stack>
        ) : items.isError ? (
          <ErrorState title="We couldn't load the list" message={errorMessage(items.error)} onRetry={() => void items.refetch()} />
        ) : (
          <SimpleTable
            aria-label={title}
            rows={items.data}
            columns={columns}
            getRowKey={(item) => item.id}
            emptyTitle="No items yet"
            emptyMessage="Add the first item of this list."
          />
        )}
      </SectionCard>
      {editing !== null && (
        <MasterItemDialog
          masterType={masterType}
          item={editing === 'new' ? null : editing}
          nextSortOrder={Math.max(0, ...(items.data ?? []).map((item) => item.sortOrder)) + 10}
          onClose={() => {
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

interface ItemForm {
  code: string;
  name: string;
  sortOrder: string;
  isActive: boolean;
}

interface MasterItemDialogProps {
  masterType: string;
  /** The item to change, or null to add one. */
  item: MasterItemDetails | null;
  nextSortOrder: number;
  onClose: () => void;
}

function MasterItemDialog({ masterType, item, nextSortOrder, onClose }: MasterItemDialogProps) {
  const form = useForm<ItemForm>({
    defaultValues: item
      ? { code: item.code, name: item.name, sortOrder: String(item.sortOrder), isActive: item.isActive }
      : { code: '', name: '', sortOrder: String(nextSortOrder), isActive: true },
  });
  const save = useSaveMasterItem(masterType);
  const notify = useNotify();
  const formId = 'master-item-form';

  const submit = (values: ItemForm) => {
    save.mutate(
      {
        id: item?.id ?? null,
        body: {
          code: values.code.trim(),
          name: values.name.trim(),
          sortOrder: Number(values.sortOrder),
          isActive: values.isActive,
          version: item?.version ?? null,
        },
      },
      {
        onSuccess: (result) => {
          notify.success(result.message ?? (item ? `"${result.data.name}" has been saved.` : `"${result.data.name}" has been added.`));
          onClose();
        },
        onError: (error) => {
          if (isConflict(error)) return;
          if (!applyServerErrors(error, form)) notify.error(error, 'The item could not be saved.');
        },
      },
    );
  };

  return (
    <Modal
      open
      title={item ? `Change "${item.name}"` : 'Add an item'}
      onClose={onClose}
      busy={save.isPending}
      actions={
        <>
          <MuiButton onClick={onClose} disabled={save.isPending}>
            Cancel
          </MuiButton>
          <Button type="submit" form={formId} variant="contained" loading={save.isPending}>
            {item ? 'Save' : 'Add'}
          </Button>
        </>
      }
    >
      <Form form={form} onSubmit={submit} id={formId}>
        <Stack spacing={2}>
          {isConflict(save.error) && <InlineAlert severity="warning">{CONFLICT_MESSAGE}</InlineAlert>}
          <FormInput<ItemForm>
            name="code"
            label="Code"
            autoFocus
            helperText="A short code, for example HYD."
            rules={{ ...required('Code'), ...maxLength(50, 'Code'), validate: notBlank('Code') }}
          />
          <FormInput<ItemForm>
            name="name"
            label="Name"
            helperText="As shown in drop-downs."
            rules={{ ...required('Name'), ...maxLength(200, 'Name'), validate: notBlank('Name') }}
          />
          <FormInput<ItemForm>
            name="sortOrder"
            label="Sort order"
            type="number"
            helperText="Lowest first in drop-downs."
            rules={{ ...required('Sort order'), validate: wholeNumber('Sort order') }}
          />
          <FormCheckbox<ItemForm> name="isActive" label="Active" helperText="Switch it off to stop offering it; it stays on records that use it." />
        </Stack>
      </Form>
    </Modal>
  );
}
