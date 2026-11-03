import type { CustomerDetails } from '@cyient/api-client/ecn';
import { applyServerErrors, Button, Form, FormInput, Modal, useNotify } from '@cyient/shared-ui';
import { maxLength, notBlank, required } from '@cyient/shared-utils';
import { Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAddCustomer } from './mutations';

interface CustomerFormValues {
  name: string;
}

/** Adds a customer by name, as through today's user link; the name is kept in capitals. A name already in the list is reused. */
export function AddCustomerDialog({ onAdded, onClose }: { onAdded: (customer: CustomerDetails) => void; onClose: () => void }) {
  const notify = useNotify();
  const add = useAddCustomer();
  const form = useForm<CustomerFormValues>({ defaultValues: { name: '' } });

  const submit = ({ name }: CustomerFormValues) => {
    add.mutate(
      { name: name.trim().toUpperCase() },
      {
        onSuccess: (customer) => {
          notify.success(`${customer.name} is in the customer list.`);
          onAdded(customer);
        },
        onError: (error) => {
          if (!applyServerErrors(error, form)) notify.error(error, 'The customer could not be added.');
        },
      },
    );
  };

  return (
    <Modal
      open
      title="Add a customer"
      onClose={onClose}
      busy={add.isPending}
      actions={
        <>
          <Button onClick={onClose} disabled={add.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="customer-form" variant="contained" loading={add.isPending}>
            Add
          </Button>
        </>
      }
    >
      <Form form={form} onSubmit={submit} id="customer-form">
        <FormInput<CustomerFormValues>
          name="name"
          label="Customer name"
          autoFocus
          rules={{ ...required('Customer name'), ...maxLength(200, 'Customer name'), validate: notBlank('Customer name') }}
        />
        <Typography variant="caption" color="text.secondary">
          Customer names are kept in capitals. If the customer is already in the list, that customer is chosen.
        </Typography>
      </Form>
    </Modal>
  );
}
