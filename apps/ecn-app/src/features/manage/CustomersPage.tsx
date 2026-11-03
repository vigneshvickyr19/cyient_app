import { isApiError } from '@cyient/api-client';
import type { CustomerDetails } from '@cyient/api-client/ecn';
import {
  applyServerErrors,
  Button,
  ErrorState,
  errorMessage,
  FilterBar,
  Form,
  FormCheckbox,
  FormInput,
  Modal,
  PageHeader,
  SearchField,
  SectionCard,
  SectionSkeleton,
  SimpleTable,
  StatusChip,
  useAuth,
  useListState,
  useNotify,
} from '@cyient/shared-ui';
import { maxLength, notBlank, required } from '@cyient/shared-utils';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { permissions } from '../../lib/permissions';
import { AddCustomerDialog } from '../masters/AddCustomerDialog';
import { useUpdateCustomer } from '../masters/mutations';
import { useCustomers } from '../masters/queries';

interface CustomerFormValues {
  name: string;
  isActive: boolean;
}

/** Renames a customer or switches it off (no longer offered for new notes) or on again; names are kept in capitals. */
function CustomerDialog({ customer, onClose }: { customer: CustomerDetails; onClose: () => void }) {
  const notify = useNotify();
  const update = useUpdateCustomer();
  const form = useForm<CustomerFormValues>({ defaultValues: { name: customer.name, isActive: customer.isActive } });

  const submit = (values: CustomerFormValues) => {
    update.mutate(
      { id: customer.id, input: { name: values.name.trim().toUpperCase(), isActive: values.isActive, version: customer.version } },
      {
        onSuccess: () => {
          notify.success('Customer saved.');
          onClose();
        },
        onError: (error) => {
          if (applyServerErrors(error, form)) return;
          notify.error(error, 'The customer could not be saved.');
          if (isApiError(error) && error.isConflict) onClose();
        },
      },
    );
  };

  return (
    <Modal
      open
      title={`Change ${customer.name}`}
      onClose={onClose}
      busy={update.isPending}
      actions={
        <>
          <Button onClick={onClose} disabled={update.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="customer-edit-form" variant="contained" loading={update.isPending}>
            Save
          </Button>
        </>
      }
    >
      <Form form={form} onSubmit={submit} id="customer-edit-form">
        <Stack spacing={2}>
          <FormInput<CustomerFormValues>
            name="name"
            label="Customer name"
            autoFocus
            rules={{ ...required('Customer name'), ...maxLength(200, 'Customer name'), validate: notBlank('Customer name') }}
            helperText="Kept in capitals. Notes already raised show the new name."
          />
          <FormCheckbox<CustomerFormValues> name="isActive" label="Active" helperText="A switched-off customer is no longer offered for new notes." />
        </Stack>
      </Form>
    </Modal>
  );
}

/** The Customer Name list for ECN admins: rename a customer or switch it off or on. Customers are never deleted. */
export function CustomersPage() {
  const { can } = useAuth();
  const list = useListState<{ search?: string }>(['search']);
  const customers = useCustomers(true);
  const [editing, setEditing] = useState<CustomerDetails | null>(null);
  const [adding, setAdding] = useState(false);
  const search = (list.filters.search ?? '').toUpperCase();
  const rows = (customers.data ?? []).filter((customer) => customer.name.includes(search));

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="The Customer Name list of every ECN and TCN"
        actions={
          can(permissions.create) && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setAdding(true); }}>
              Add customer
            </Button>
          )
        }
      />
      <FilterBar active={list.filtered} onClear={list.clearFilters}>
        <SearchField value={list.filters.search ?? ''} onSearch={(value) => { list.setFilters({ search: value }); }} placeholder="Customer name" />
      </FilterBar>
      <SectionCard title="Customers" subheader={customers.data ? `${rows.length} of ${customers.data.length}` : undefined} flush>
        {customers.isPending ? (
          <SectionSkeleton />
        ) : customers.isError ? (
          <ErrorState message={errorMessage(customers.error)} onRetry={() => void customers.refetch()} />
        ) : (
          <SimpleTable<CustomerDetails>
            aria-label="Customers"
            rows={rows}
            getRowKey={(row) => row.id}
            columns={[
              { key: 'name', header: 'Name', render: (row) => <Typography variant="body2">{row.name}</Typography> },
              { key: 'status', header: 'Status', width: 140, render: (row) => <StatusChip label={row.isActive ? 'Active' : 'Switched off'} tone={row.isActive ? 'success' : 'neutral'} /> },
              {
                key: 'edit',
                header: 'Change',
                align: 'right',
                width: 90,
                render: (row) => (
                  <Tooltip title="Change">
                    <IconButton aria-label={`Change ${row.name}`} onClick={() => { setEditing(row); }}>
                      <EditOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                ),
              },
            ]}
            emptyTitle={search ? 'No customers match this search' : 'No customers yet'}
          />
        )}
      </SectionCard>
      {editing && <CustomerDialog customer={editing} onClose={() => { setEditing(null); }} />}
      {adding && <AddCustomerDialog onAdded={() => { setAdding(false); }} onClose={() => { setAdding(false); }} />}
    </>
  );
}
