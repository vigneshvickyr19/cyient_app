import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@cyient/api-client';
import { required } from '@cyient/shared-utils';
import { Button } from '../components/Button';
import { renderWithProviders } from '../test';
import { FormDropdown, FormInput } from './fields';
import { applyServerErrors, Form } from './Form';

interface DraftForm {
  documentReference: string;
  locationId: number | null;
}

function DraftFormPage({ onSave, serverError }: { onSave: (values: DraftForm) => void; serverError?: ApiError }) {
  const form = useForm<DraftForm>({ defaultValues: { documentReference: '', locationId: null } });
  return (
    <Form
      form={form}
      onSubmit={(values) => {
        if (serverError) applyServerErrors(serverError, form);
        else onSave(values);
      }}
    >
      <FormInput<DraftForm> name="documentReference" label="Document reference" rules={required('Document reference')} />
      <FormDropdown<DraftForm, number>
        name="locationId"
        label="Location"
        rules={required('Location')}
        options={[
          { value: 1, label: 'Hyderabad Unit' },
          { value: 2, label: 'Bengaluru Unit' },
        ]}
      />
      <Button type="submit">Save</Button>
    </Form>
  );
}

describe('form fields', () => {
  it('shows required messages and marks required fields', async () => {
    const onSave = vi.fn();
    renderWithProviders(<DraftFormPage onSave={onSave} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Document reference is required.')).toBeInTheDocument();
    expect(screen.getByText('Location is required.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Document reference/ })).toBeRequired();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('submits typed values: a chosen id stays a number', async () => {
    const onSave = vi.fn();
    renderWithProviders(<DraftFormPage onSave={onSave} />);

    await userEvent.type(await screen.findByRole('textbox', { name: /Document reference/ }), 'QMS-PR-07');
    await userEvent.click(screen.getByRole('combobox', { name: /Location/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'Bengaluru Unit' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith({ documentReference: 'QMS-PR-07', locationId: 2 });
  });

  it("places the API's field errors on the matching fields", async () => {
    const serverError = new ApiError(400, 'Check the highlighted fields.', {
      errors: [{ code: 'VALIDATION', field: 'DocumentReference', message: 'This reference is already in use.' }],
    });
    renderWithProviders(<DraftFormPage onSave={vi.fn()} serverError={serverError} />);

    await userEvent.type(await screen.findByRole('textbox', { name: /Document reference/ }), 'QMS-PR-07');
    await userEvent.click(screen.getByRole('combobox', { name: /Location/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'Hyderabad Unit' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('This reference is already in use.')).toBeInTheDocument();
  });
});
