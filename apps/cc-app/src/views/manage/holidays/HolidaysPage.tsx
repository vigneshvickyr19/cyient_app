import { isApiError } from '@cyient/api-client';
import type { HolidayDetails } from '@cyient/api-client/cc';
import { applyServerErrors, Button, Dropdown, errorMessage, ErrorState, FilterToolbar, Form, FormCheckbox, FormDatePicker, FormInput, Modal, PageHeader, SectionCard, SectionSkeleton, SimpleTable, StatusChip, useListState } from '@cyient/shared-ui';
import { businessToday, formatDate, maxLength } from '@cyient/shared-utils';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { IconButton, Stack, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { QUERY_PARAMS } from '@/constants/query-params';
import { getYearOptions } from '@/constants/static-dropdowns';
import { useHolidays, useSaveHoliday } from '@/hooks/manage/queries';

interface HolidayValues {
  holidayDate: string | null;
  name: string;
  isActive: boolean;
}

function HolidayDialog({ holiday, year, onClose }: { holiday: HolidayDetails | null; year: number; onClose: () => void }) {
  const save = useSaveHoliday();
  const form = useForm<HolidayValues>({
    defaultValues: { holidayDate: holiday?.holidayDate ?? null, name: holiday?.name ?? '', isActive: holiday?.isActive ?? true },
  });

  const submit = (values: HolidayValues) => {
    save.mutate(
      { id: holiday?.id ?? null, input: { holidayDate: values.holidayDate, name: values.name.trim(), isActive: values.isActive, version: holiday?.version ?? null } },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (error) => {
          if (isApiError(error) && error.hasCode('CC_HOLIDAY_EXISTS')) {
            form.setError('holidayDate', { type: 'server', message: error.message }, { shouldFocus: true });
          } else {
            applyServerErrors(error, form);
          }
        },
      },
    );
  };

  return (
    <Modal
      open
      title={holiday ? 'Change the holiday' : 'Add a holiday'}
      onClose={onClose}
      busy={save.isPending}
      actions={
        <>
          <Button onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="holiday-form" variant="contained" loading={save.isPending}>
            {holiday ? 'Save' : 'Add'}
          </Button>
        </>
      }
    >
      <Form form={form} onSubmit={submit} id="holiday-form">
        <Stack spacing={2}>
          <FormDatePicker<HolidayValues>
            name="holidayDate"
            label="Date"
            minDate={holiday ? undefined : `${year}-01-01`}
            maxDate={holiday ? undefined : `${year}-12-31`}
            rules={{ required: 'The date is required.' }}
          />
          <FormInput<HolidayValues>
            name="name"
            label="Name"
            placeholder="For example Diwali"
            rules={{
              required: 'The name is required.',
              validate: (value) => (typeof value === 'string' && value.trim() !== '') || 'The name is required.',
              ...maxLength(200, 'The name'),
            }}
          />
          <FormCheckbox<HolidayValues> name="isActive" label="Counts as a holiday" helperText="Switch a day off instead of deleting it; days are kept." />
        </Stack>
      </Form>
    </Modal>
  );
}

const currentYear = () => Number(businessToday().slice(0, 4));

/** The holiday calendar by year: add a day, change it or switch it off (days are never deleted). */
export function HolidaysPage() {
  const list = useListState<{ year?: string }>([QUERY_PARAMS.YEAR]);
  const thisYear = currentYear();
  const year = Number(list.filters.year) || thisYear;
  const holidays = useHolidays(year);
  const [editing, setEditing] = useState<HolidayDetails | 'new' | null>(null);
  const years = getYearOptions(thisYear);

  return (
    <>
      <PageHeader
        title="Holiday calendar"
        subtitle="Days the follow-up emails of open D5 actions can skip"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing('new'); }}>
            Add holiday
          </Button>
        }
      />
      <FilterToolbar list={list} fields={['year']}>
        {(_, change) => (
          <>
            <Dropdown label="Year" options={years} value={year} onChange={(value) => { change({ year: value === null || value === thisYear ? undefined : String(value) }); }} />
          </>
        )}
      </FilterToolbar>
      <SectionCard title={`Holidays in ${year}`} flush>
        {holidays.isPending ? (
          <SectionSkeleton />
        ) : holidays.isError ? (
          <ErrorState message={errorMessage(holidays.error)} onRetry={() => void holidays.refetch()} />
        ) : (
          <SimpleTable<HolidayDetails>
            aria-label="Holidays"
            rows={holidays.data}
            getRowKey={(row) => row.id}
            columns={[
              { key: 'date', header: 'Date', render: (row) => formatDate(row.holidayDate), width: 140 },
              { key: 'name', header: 'Name', render: (row) => row.name },
              {
                key: 'state',
                header: 'State',
                render: (row) => <StatusChip label={row.isActive ? 'Holiday' : 'Switched off'} tone={row.isActive ? 'success' : 'neutral'} />,
                width: 140,
              },
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
            ]}
            emptyTitle={`No holidays in ${year}`}
            emptyMessage="Add the days with Add holiday."
          />
        )}
      </SectionCard>
      {editing && (
        <HolidayDialog
          holiday={editing === 'new' ? null : editing}
          year={year}
          onClose={() => {
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
