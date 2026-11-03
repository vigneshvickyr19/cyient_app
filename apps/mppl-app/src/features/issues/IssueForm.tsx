import type { IssueDetails, IssueInput, PoLineDetails, SourcingDetails } from '@cyient/api-client/mppl';
import {
  applyServerErrors,
  Button,
  errorMessage,
  Form,
  FormDropdown,
  FormInput,
  FormTextArea,
  InlineAlert,
  SectionCard,
  SectionSkeleton,
  DetailList,
  useDebouncedValue,
  useMasterOptions,
  useNotify,
  type FieldRules,
} from '@cyient/shared-ui';
import {
  combine,
  formatCurrency,
  formatDate,
  formatNumber,
  maxLength,
  numberOrNull,
  required,
  wholeNumber,
  type Validator,
} from '@cyient/shared-utils';
import { Box, Stack, Typography } from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';
import { usePoLine, useSourcingLookup } from './queries';
import { valueImpactOf } from './valueImpact';

/** The New Issue form, as the API's IssueInputValidator has it: project, commodity, PO, PO line and issue are required. */
export interface IssueFormValues {
  projectId: number | null;
  commodityId: number | null;
  poNumber: string;
  poLineNumber: string;
  issueTypeId: number | null;
  newPrice: string;
  newQuantity: string;
  remarks: string;
}

const REMARKS_LENGTH = 4000;

/** A PO line number the lookup can use: a whole number above zero. */
function lineNumberOf(text: string): number | null {
  const line = numberOrNull(text);
  return line !== null && Number.isInteger(line) && line > 0 ? line : null;
}

/** A new price or quantity the value impact can use: a number of zero or more. */
function amountOf(text: string): number | null {
  const amount = numberOrNull(text);
  return amount !== null && Number.isFinite(amount) && amount >= 0 ? amount : null;
}

const lineRules: FieldRules<IssueFormValues, 'poLineNumber'> = {
  ...required('PO Line Number'),
  validate: combine<string>(wholeNumber('PO Line Number'), (value) => value.trim() === '' || Number(value) > 0 || 'PO Line Number must be more than 0.'),
};

/** Optional, zero or more (the API's "can't be negative" rule). */
const amount =
  (label: string): Validator<string> =>
  (value) => {
    if (value.trim() === '') return true;
    const number = Number(value);
    if (!Number.isFinite(number)) return `${label} must be a number.`;
    return number >= 0 || `${label} can't be negative.`;
  };

function formValuesOf(issue?: IssueDetails): IssueFormValues {
  const text = (value: number | null | undefined) => (value === null || value === undefined ? '' : String(value));
  return {
    projectId: issue?.project.id ?? null,
    commodityId: issue?.commodity.id ?? null,
    poNumber: issue?.poNumber ?? '',
    poLineNumber: text(issue?.poLineNumber),
    issueTypeId: issue?.issueType.id ?? null,
    newPrice: text(issue?.newPrice),
    newQuantity: text(issue?.newQuantity),
    remarks: issue?.remarks ?? '',
  };
}

function inputOf(values: IssueFormValues, version?: string): IssueInput {
  return {
    projectId: values.projectId ?? 0,
    commodityId: values.commodityId ?? 0,
    poNumber: values.poNumber.trim(),
    poLineNumber: numberOrNull(values.poLineNumber),
    issueTypeId: values.issueTypeId ?? 0,
    newPrice: numberOrNull(values.newPrice),
    newQuantity: numberOrNull(values.newQuantity),
    remarks: values.remarks.trim() || null,
    version: version ?? null,
  };
}

const Hint = ({ children }: { children: string }) => (
  <Typography variant="body2" color="text.secondary">
    {children}
  </Typography>
);

function PoDetails({ line }: { line: PoLineDetails }) {
  return (
    <DetailList
      columns={3}
      items={[
        { label: 'PO date', value: formatDate(line.poDate) },
        { label: 'Part number', value: line.partNumber },
        { label: 'Quantity', value: formatNumber(line.quantity) },
        { label: 'Supplier', value: line.supplierName },
        { label: 'MPN', value: line.mpn },
        { label: 'Make', value: line.make },
        { label: 'System price', value: formatNumber(line.price, 4) },
        { label: 'Currency', value: line.currency },
        { label: 'MOQ', value: formatNumber(line.moq) },
      ]}
    />
  );
}

function SourcingSummary({ sourcing }: { sourcing: SourcingDetails }) {
  return (
    <DetailList
      columns={3}
      items={[
        { label: 'Sourcing Lead', value: sourcing.sourcingLead.name },
        { label: 'Customer', value: sourcing.customerName },
        { label: 'Customer group', value: sourcing.customerGroup },
        { label: 'Segment', value: sourcing.segment },
        { label: 'Escalation level 1', value: sourcing.escalation1?.name },
        { label: 'Escalation level 2', value: sourcing.escalation2?.name },
        { label: 'Escalation level 3', value: sourcing.escalation3?.name },
      ]}
    />
  );
}

const threeColumns = { display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' } } as const;

/**
 * The PO line looked up for the PO number and line in the form, once typing has paused. A result counts only for what
 * is in the fields now, not for what was typed a moment ago.
 */
function usePoLineLookup() {
  const [poNumber, poLineNumber] = useWatch<IssueFormValues, ['poNumber', 'poLineNumber']>({ name: ['poNumber', 'poLineNumber'] });
  const enteredPo = poNumber.trim();
  const enteredLine = lineNumberOf(poLineNumber);
  const lookupPo = useDebouncedValue(enteredPo);
  const lookupLine = useDebouncedValue(enteredLine);
  const poLine = usePoLine(lookupPo, lookupLine);
  const complete = enteredPo !== '' && enteredLine !== null;
  const current = complete && lookupPo === enteredPo && lookupLine === enteredLine;
  return {
    complete,
    line: current ? poLine.data : undefined,
    error: current && poLine.isError ? errorMessage(poLine.error) : undefined,
  };
}

function PoLineSection() {
  const { complete, line, error } = usePoLineLookup();
  return (
    <SectionCard title="PO line" subheader="The PO details come from the PO data loaded from SAP each morning.">
      <Stack spacing={2}>
        <Box sx={threeColumns}>
          <FormInput<IssueFormValues> name="poNumber" label="PO number" rules={{ ...required('PO'), ...maxLength(20, 'PO') }} />
          {/* A failed PO line lookup (MPPL_PO_LINE_NOT_FOUND) shows as the PO line's error */}
          <FormInput<IssueFormValues, 'poLineNumber'> name="poLineNumber" label="PO line" type="number" rules={lineRules} error={error} helperText="10, 20, 30…" min={1} step={1} />
        </Box>
        {!complete ? (
          <Hint>Enter the PO number and line to see the PO details.</Hint>
        ) : line ? (
          <PoDetails line={line} />
        ) : error ? (
          <Hint>Check the PO number and line.</Hint>
        ) : (
          <SectionSkeleton rows={2} />
        )}
      </Stack>
    </SectionCard>
  );
}

function SourcingSection() {
  const [projectId, commodityId] = useWatch<IssueFormValues, ['projectId', 'commodityId']>({ name: ['projectId', 'commodityId'] });
  const sourcing = useSourcingLookup(projectId, commodityId);
  return (
    <SectionCard title="Sourcing" subheader="From the sourcing master for the project and commodity. The issue goes to this Sourcing Lead.">
      {projectId === null || commodityId === null ? (
        <Hint>Choose the project and commodity to see the Sourcing Lead.</Hint>
      ) : sourcing.isPending ? (
        <SectionSkeleton rows={2} />
      ) : sourcing.isError ? (
        <InlineAlert severity="warning" title="No Sourcing Lead">
          {errorMessage(sourcing.error)} Ask an administrator to add the project to the sourcing master.
        </InlineAlert>
      ) : (
        <SourcingSummary sourcing={sourcing.data} />
      )}
    </SectionCard>
  );
}

/** The new price and quantity, with a live preview of the value impact the API will work out and keep. */
function ChangeSection({ savedCurrency }: { savedCurrency: string | null }) {
  const { line } = usePoLineLookup();
  const [newPrice, newQuantity] = useWatch<IssueFormValues, ['newPrice', 'newQuantity']>({ name: ['newPrice', 'newQuantity'] });
  const impact = line ? valueImpactOf(line.price, line.quantity, amountOf(newPrice), amountOf(newQuantity)) : null;
  const currency = line?.currency ?? savedCurrency;

  return (
    <SectionCard title="Change requested" subheader="For a price or quantity change, enter the new price, the new quantity or both.">
      <Stack spacing={2}>
        <Box sx={threeColumns}>
          <FormInput<IssueFormValues, 'newPrice'>
            name="newPrice"
            label={currency ? `New price (${currency})` : 'New price'}
            type="number"
            rules={{ validate: amount('New price') }}
          />
          <FormInput<IssueFormValues, 'newQuantity'> name="newQuantity" label="New quantity" type="number" rules={{ validate: amount('New quantity') }} />
          <Box role="status" aria-label="Value impact" sx={{ px: 2, py: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
            <Typography variant="caption" color="text.secondary">
              Value impact
            </Typography>
            <Typography variant="h6" component="p">
              {impact === null ? '—' : formatCurrency(impact, currency)}
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Value impact = (new price or system price) × (new quantity or PO quantity) − system price × PO quantity. It is worked out again
          and kept when the issue is saved.
        </Typography>
        <FormTextArea<IssueFormValues> name="remarks" label="Remarks" rules={maxLength(REMARKS_LENGTH, 'Remarks')} />
      </Stack>
    </SectionCard>
  );
}

interface IssueFormProps {
  issue?: IssueDetails;
  saving: boolean;
  onSave: (input: IssueInput) => Promise<unknown>;
  onCancel: () => void;
}

/**
 * The New Issue form for a new or draft issue. The PO details are filled in from the PO data as the buyer enters the
 * PO and line, and the Sourcing Lead from the sourcing master for the project and commodity; the API applies both
 * again when the draft is saved. Each section watches only its own fields, so typing doesn't redraw the whole form.
 */
export function IssueForm({ issue, saving, onSave, onCancel }: IssueFormProps) {
  const notify = useNotify();
  const form = useForm<IssueFormValues>({ defaultValues: formValuesOf(issue), mode: 'onTouched' });
  const projects = useMasterOptions('Project');
  const commodities = useMasterOptions('Commodity');
  const issueTypes = useMasterOptions('IssueType');

  const submit = async (values: IssueFormValues) => {
    try {
      await onSave(inputOf(values, issue?.version));
    } catch (error) {
      if (!applyServerErrors(error, form)) notify.error(error, 'The issue could not be saved.');
    }
  };

  return (
    <Form form={form} onSubmit={submit}>
      <Stack spacing={3}>
        <SectionCard title="Issue">
          <Box sx={threeColumns}>
            <FormDropdown<IssueFormValues, number> name="projectId" label="Project" options={projects} rules={required('Project')} />
            <FormDropdown<IssueFormValues, number> name="commodityId" label="Commodity" options={commodities} rules={required('Commodity')} />
            <FormDropdown<IssueFormValues, number> name="issueTypeId" label="Issue" options={issueTypes} rules={required('Issue')} />
          </Box>
        </SectionCard>
        <PoLineSection />
        <SourcingSection />
        <ChangeSection savedCurrency={issue?.currency ?? null} />

        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={saving}>
            {issue ? 'Save changes' : 'Save draft'}
          </Button>
        </Stack>
      </Stack>
    </Form>
  );
}
