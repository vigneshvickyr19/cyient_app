import type { AttachmentKind, DraftDetails, EcnKind, FaiRequirement, NoteDetails, NoteType } from '@cyient/api-client/ecn';
import {
  applyServerErrors,
  Button,
  documentUpload,
  Form,
  FormDatePicker,
  FormDropdown,
  FormFileUpload,
  FormInput,
  FormPeoplePicker,
  FormRadioGroup,
  FormTextArea,
  InlineAlert,
  SectionCard,
  useAuth,
  useMasterOptions,
  useNotify,
  type Option,
  type PersonOption,
} from '@cyient/shared-ui';
import { businessToday, maxLength, notInFuture, required } from '@cyient/shared-utils';
import AddIcon from '@mui/icons-material/Add';
import { Box, Stack } from '@mui/material';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { AddCustomerDialog } from '../masters/AddCustomerDialog';
import { useCustomerOptions } from '../masters/queries';
import { permissions } from '../../lib/permissions';
import { attachmentExtensions, faiOptions, kindOptions, typeOptions } from './status';

type Kind = NonNullable<EcnKind>;
type YesNo = 'Yes' | 'No';

/** The New ECN / New TCN front page, as the API's draft rules have it (DraftDetailsValidator). */
export interface NoteFormValues {
  noteType: NoteType | null;
  ecnKind: Kind | null;
  sapEcnNumber: string;
  sapEcnDate: string | null;
  sapEcnPdf: File[];
  productNumber: string;
  productDescription: string;
  productRevisionNumber: string;
  customerId: number | null;
  customerProductNumber: string;
  customerEcnNumber: string;
  customerEcnDate: string | null;
  customerTcnNumber: string;
  effectiveSerialNumber: string;
  category1Id: number | null;
  category2Id: number | null;
  fai: FaiRequirement | null;
  implementationDate: string | null;
  ecrApprovalFromCustomer: YesNo | null;
  ecrApprovalFiles: File[];
  customerDocuments: File[];
  summary: string;
  reasonForChange: string;
  comments: string;
  reviewer: PersonOption | null;
  approver: PersonOption | null;
}

/** A document chosen on the form, uploaded once the draft is saved. */
export interface PendingUpload {
  file: File;
  kind: AttachmentKind;
}

const LONG_TEXT = 4000;

/** RULE-01: the SAP ECN number is the 12-digit 5-series number from SAP. */
const SAP_NUMBER = /^\s*5\d{11}\s*$/;

const yesNo: Option<YesNo>[] = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];

function formValuesOf(note: NoteDetails | undefined, type: NoteType | null): NoteFormValues {
  const person = (ref: { id: number; name: string | null } | undefined) => (ref ? { id: ref.id, name: ref.name ?? '' } : null);
  return {
    noteType: note?.noteType ?? type,
    ecnKind: note?.ecnKind ?? null,
    sapEcnNumber: note?.sapEcnNumber ?? '',
    sapEcnDate: note?.sapEcnDate ?? null,
    sapEcnPdf: [],
    productNumber: note?.productNumber ?? '',
    productDescription: note?.productDescription ?? '',
    productRevisionNumber: note?.productRevisionNumber ?? '',
    customerId: note?.customer.id ?? null,
    customerProductNumber: note?.customerProductNumber ?? '',
    customerEcnNumber: note?.customerEcnNumber ?? '',
    customerEcnDate: note?.customerEcnDate ?? null,
    customerTcnNumber: note?.customerTcnNumber ?? '',
    effectiveSerialNumber: note?.effectiveSerialNumber ?? '',
    category1Id: note?.category1.id ?? null,
    category2Id: note?.category2.id ?? null,
    fai: note?.fai ?? null,
    implementationDate: note?.implementationDate ?? null,
    ecrApprovalFromCustomer: note ? (note.ecrApprovalFromCustomer ? 'Yes' : 'No') : null,
    ecrApprovalFiles: [],
    customerDocuments: [],
    summary: note?.summary ?? '',
    reasonForChange: note?.reasonForChange ?? '',
    comments: note?.comments ?? '',
    reviewer: person(note?.reviewer),
    approver: person(note?.approver),
  };
}

/** Only the fields of the chosen type are sent; the API refuses the others (ECN_FIELD_NOT_APPLICABLE). */
function draftOf(values: NoteFormValues, version?: string): DraftDetails {
  const isEcn = values.noteType === 'Ecn';
  const isSap = isEcn && values.ecnKind === 'Sap';
  const text = (value: string) => value.trim();
  return {
    noteType: values.noteType,
    ecnKind: isEcn ? values.ecnKind : null,
    sapEcnNumber: isSap ? text(values.sapEcnNumber) : null,
    sapEcnDate: isSap ? values.sapEcnDate : null,
    productNumber: text(values.productNumber),
    productDescription: text(values.productDescription),
    productRevisionNumber: text(values.productRevisionNumber),
    customerId: values.customerId ?? 0,
    customerProductNumber: text(values.customerProductNumber),
    customerEcnNumber: isEcn ? text(values.customerEcnNumber) : null,
    customerEcnDate: isEcn ? values.customerEcnDate : null,
    customerTcnNumber: isEcn ? null : text(values.customerTcnNumber),
    effectiveSerialNumber: isEcn ? null : text(values.effectiveSerialNumber),
    reasonForChange: isEcn ? null : text(values.reasonForChange),
    category1Id: values.category1Id ?? 0,
    category2Id: values.category2Id ?? 0,
    fai: values.fai,
    implementationDate: values.implementationDate,
    ecrApprovalFromCustomer: values.ecrApprovalFromCustomer === null ? null : values.ecrApprovalFromCustomer === 'Yes',
    summary: text(values.summary),
    comments: text(values.comments) || null,
    reviewerUserId: values.reviewer?.id ?? null,
    approverUserId: values.approver?.id ?? null,
    version: version ?? null,
  };
}

/** The documents chosen on the form that apply to the chosen type. */
function uploadsOf(values: NoteFormValues): PendingUpload[] {
  const isSap = values.noteType === 'Ecn' && values.ecnKind === 'Sap';
  return [
    ...(isSap ? values.sapEcnPdf.map((file) => ({ file, kind: 'SapEcn' as const })) : []),
    ...(values.ecrApprovalFromCustomer === 'Yes' ? values.ecrApprovalFiles.map((file) => ({ file, kind: 'EcrApproval' as const })) : []),
    ...values.customerDocuments.map((file) => ({ file, kind: 'CustomerDocument' as const })),
  ];
}

const serverFieldNames = { reviewerUserId: 'reviewer', approverUserId: 'approver' } as const;

const grid = { display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' } } as const;

interface NoteFormProps {
  note?: NoteDetails;
  /** The type chosen before the form opened (New ECN, New TCN). */
  type?: NoteType | null;
  saving: boolean;
  onSave: (draft: DraftDetails, uploads: PendingUpload[]) => Promise<unknown>;
  onCancel: () => void;
}

/**
 * The front page of a new or draft ECN or TCN. A SAP ECN takes its number, date and the one PDF from SAP; a TCN needs
 * every field (NA when not available). The type can't change once the note has its number.
 */
export function NoteForm({ note, type = null, saving, onSave, onCancel }: NoteFormProps) {
  const { user, can } = useAuth();
  const notify = useNotify();
  const form = useForm<NoteFormValues>({ defaultValues: formValuesOf(note, type), mode: 'onTouched' });
  const [addingCustomer, setAddingCustomer] = useState(false);
  const customers = useCustomerOptions();
  const categories1 = useMasterOptions('EcnCategory1');
  const categories2 = useMasterOptions('EcnCategory2');
  const [noteType, ecnKind, ecrApproval, reviewer, approver] = useWatch({
    control: form.control,
    name: ['noteType', 'ecnKind', 'ecrApprovalFromCustomer', 'reviewer', 'approver'],
  });
  const isEcn = noteType === 'Ecn';
  const isTcn = noteType === 'Tcn';
  const isSap = isEcn && ecnKind === 'Sap';
  const numbered = Boolean(note);
  const attached = (kind: AttachmentKind) => (note?.attachments ?? []).some((a) => a.kind === kind);
  const hasSapPdf = attached('SapEcn');
  const hasEcrApproval = attached('EcrApproval');

  const submit = async (submitted: NoteFormValues) => {
    // Disabled fields are left out of the submitted values: a numbered note keeps its type
    const values = note ? { ...submitted, noteType: note.noteType, ecnKind: note.ecnKind ?? null } : submitted;
    try {
      await onSave(draftOf(values, note?.version), uploadsOf(values));
    } catch (error) {
      if (!applyServerErrors(error, form, serverFieldNames)) notify.error(error, 'The note could not be saved.');
    }
  };

  return (
    <>
      <Form form={form} onSubmit={submit}>
        <Stack spacing={3}>
          <SectionCard title="ECN or TCN" subheader={numbered ? "The type can't be changed once the note has its number; raise a new one instead." : undefined}>
            <Stack spacing={2}>
              <Box sx={grid}>
                <FormRadioGroup<NoteFormValues, NoteType> name="noteType" label="ECN or TCN" options={typeOptions} disabled={numbered} rules={{ required: 'ECN or TCN is required.' }} />
                {isEcn && (
                  <FormRadioGroup<NoteFormValues, Kind>
                    name="ecnKind"
                    label="Cyient ECN type"
                    options={kindOptions}
                    disabled={numbered}
                    rules={{ required: 'Cyient ECN Type is required.' }}
                    helperText={numbered ? undefined : 'A SAP ECN takes its number from SAP; a non-SAP ECN gets a 6-series number.'}
                  />
                )}
              </Box>
              {isSap && (
                <Box sx={grid}>
                  <FormInput<NoteFormValues>
                    name="sapEcnNumber"
                    label="SAP ECN number"
                    placeholder="5xxxxxxxxxxx"
                    rules={{
                      required: 'SAP ECN Number is required for a SAP ECN.',
                      validate: (value: unknown) => (typeof value === 'string' && SAP_NUMBER.test(value)) || 'SAP ECN Number is the 12-digit 5-series number from SAP.',
                    }}
                  />
                  <FormDatePicker<NoteFormValues>
                    name="sapEcnDate"
                    label="SAP ECN date"
                    maxDate={businessToday()}
                    rules={{
                      required: 'SAP ECN Date is required for a SAP ECN.',
                      validate: (value: unknown) => notInFuture('SAP ECN Date')(value) === true || "SAP ECN Date can't be in the future.",
                    }}
                  />
                  <FormFileUpload<NoteFormValues>
                    name="sapEcnPdf"
                    label={hasSapPdf ? 'Replace the SAP ECN PDF' : 'SAP ECN PDF'}
                    extensions={['.pdf']}
                    maxSizeMb={documentUpload.maxSizeMb}
                    helperText={hasSapPdf ? 'The PDF is attached; a new one becomes its next version.' : 'The one PDF from SAP.'}
                    rules={{ validate: (files: unknown) => hasSapPdf || (Array.isArray(files) && files.length === 1) || 'Attach the SAP ECN PDF.' }}
                  />
                </Box>
              )}
            </Stack>
          </SectionCard>

          <SectionCard title="Product and customer">
            <Stack spacing={2}>
              <Box sx={grid}>
                <FormInput<NoteFormValues> name="productNumber" label="Product number" rules={{ ...required('Product Number'), ...maxLength(100, 'Product Number') }} />
                <FormInput<NoteFormValues>
                  name="productRevisionNumber"
                  label="Product revision number"
                  rules={{ ...required('Product Revision Number'), ...maxLength(50, 'Product Revision Number') }}
                />
                <FormInput<NoteFormValues>
                  name="customerProductNumber"
                  label="Customer product number"
                  rules={{ ...required('Customer Product Number'), ...maxLength(100, 'Customer Product Number') }}
                />
              </Box>
              <FormTextArea<NoteFormValues>
                name="productDescription"
                label="Product description (card type)"
                minRows={2}
                rules={{ ...required('Product Description (Card Type)'), ...maxLength(500, 'Product Description (Card Type)') }}
              />
              <Box sx={grid}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <FormDropdown<NoteFormValues, number> name="customerId" label="Customer name" options={customers} rules={required('Customer Name')} />
                  </Box>
                  {can(permissions.create) && (
                    <Button startIcon={<AddIcon />} onClick={() => { setAddingCustomer(true); }} sx={{ mt: 0.5, flexShrink: 0 }}>
                      Add
                    </Button>
                  )}
                </Stack>
                {isEcn && (
                  <>
                    <FormInput<NoteFormValues>
                      name="customerEcnNumber"
                      label="Customer ECN number"
                      helperText="Enter NA when there is none."
                      rules={{ required: 'Customer ECN Number is required; enter NA when there is none.', ...maxLength(100, 'Customer ECN Number') }}
                    />
                    <FormDatePicker<NoteFormValues> name="customerEcnDate" label="Customer ECN date" helperText="Leave empty when there is none." />
                  </>
                )}
                {isTcn && (
                  <FormInput<NoteFormValues>
                    name="customerTcnNumber"
                    label="Customer TCN number"
                    helperText="Enter NA when there is none."
                    rules={{ required: 'Customer TCN Number is required; enter NA when there is none.', ...maxLength(100, 'Customer TCN Number') }}
                  />
                )}
              </Box>
              {isTcn && (
                <FormTextArea<NoteFormValues>
                  name="effectiveSerialNumber"
                  label="Effective product serial number"
                  minRows={2}
                  helperText="Enter NA when not available."
                  rules={{ ...required('Effective Product Serial Number'), ...maxLength(1000, 'Effective Product Serial Number') }}
                />
              )}
            </Stack>
          </SectionCard>

          <SectionCard title="The change">
            <Stack spacing={2}>
              <Box sx={grid}>
                <FormDropdown<NoteFormValues, number> name="category1Id" label="Category 1" options={categories1} rules={required('Category 1')} />
                <FormDropdown<NoteFormValues, number> name="category2Id" label="Category 2" options={categories2} rules={required('Category 2')} />
                <FormDatePicker<NoteFormValues> name="implementationDate" label="ECN implementation date" helperText="Tentative" rules={required('ECN Implementation Date')} />
                <FormRadioGroup<NoteFormValues, FaiRequirement> name="fai" label="FAI" options={faiOptions} rules={required('FAI')} />
                <FormRadioGroup<NoteFormValues, YesNo>
                  name="ecrApprovalFromCustomer"
                  label="ECR approval from customer"
                  options={yesNo}
                  rules={required('ECR Approval From Customer')}
                />
              </Box>
              <FormTextArea<NoteFormValues> name="summary" label="Summary of change" rules={{ required: 'Summary of ECN is required.', ...maxLength(LONG_TEXT, 'Summary') }} />
              {isTcn && (
                <FormTextArea<NoteFormValues>
                  name="reasonForChange"
                  label="Reason for change"
                  helperText="Enter NA when not available."
                  rules={{ ...required('Reason for Change'), ...maxLength(LONG_TEXT, 'Reason for Change') }}
                />
              )}
              <FormTextArea<NoteFormValues>
                name="comments"
                label="Comments"
                helperText={isTcn ? 'Enter NA when there are none.' : undefined}
                rules={{
                  ...(isTcn ? { required: 'Comments are required on a TCN; enter NA when there are none.' } : {}),
                  ...maxLength(LONG_TEXT, 'Comments'),
                }}
              />
            </Stack>
          </SectionCard>

          <SectionCard title="Customer documents" subheader="Uploaded when the draft is saved. More can be added on the Attachments tab while it is a draft.">
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } }}>
              <FormFileUpload<NoteFormValues>
                name="customerDocuments"
                label="Customer ECN / TCN documents"
                multiple
                extensions={attachmentExtensions}
                maxSizeMb={documentUpload.maxSizeMb}
              />
              {ecrApproval === 'Yes' && (
                <FormFileUpload<NoteFormValues>
                  name="ecrApprovalFiles"
                  label="ECR approval from the customer"
                  multiple
                  extensions={attachmentExtensions}
                  maxSizeMb={documentUpload.maxSizeMb}
                  helperText={hasEcrApproval ? 'The ECR approval is attached; add more if needed.' : 'Required when the customer approved the ECR.'}
                  rules={{ validate: (files: unknown) => hasEcrApproval || (Array.isArray(files) && files.length > 0) || 'Attach the ECR approval from the customer.' }}
                />
              )}
            </Box>
          </SectionCard>

          <SectionCard title="Reviewer and Approver" subheader="After the CFT closes its actions, the note goes to the Reviewer, then to the Approver.">
            <Stack spacing={2}>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } }}>
                <FormPeoplePicker<NoteFormValues> name="reviewer" label="Reviewer" excludeIds={[user.userId]} rules={required('Reviewer')} />
                <FormPeoplePicker<NoteFormValues> name="approver" label="Approver" excludeIds={[user.userId]} rules={required('Approver')} />
              </Box>
              {reviewer && reviewer.id === approver?.id && <InlineAlert>The same person reviews and approves this note.</InlineAlert>}
            </Stack>
          </SectionCard>

          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            <Button onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" loading={saving}>
              {note ? 'Save changes' : 'Save draft'}
            </Button>
          </Stack>
        </Stack>
      </Form>

      {/* Outside the form: a dialog's submit would otherwise bubble to the note's form */}
      {addingCustomer && (
        <AddCustomerDialog
          onClose={() => { setAddingCustomer(false); }}
          onAdded={(customer) => {
            form.setValue('customerId', customer.id, { shouldValidate: true, shouldDirty: true });
            setAddingCustomer(false);
          }}
        />
      )}
    </>
  );
}
