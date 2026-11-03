import type { CftTeamRow, NoteDetails } from '@cyient/api-client/ecn';
import { Button, Form, FormCheckbox, SectionCard, SimpleTable, useActionFailure, useNotify, type SimpleColumn } from '@cyient/shared-ui';
import { Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { noteKeys } from './keys';
import { useSetAttendance } from './mutations';

interface AttendanceFormValues {
  rows: { functionId: number; attended: boolean }[];
}

/** The TCN attendance: who of the named members attended the CFT meeting, recorded by the initiator while in CFT Meeting. */
export function AttendanceSection({ note }: { note: NoteDetails }) {
  const notify = useNotify();
  const failed = useActionFailure(noteKeys.detail(note.publicId), { exact: true, fallback: 'The attendance could not be saved.' });
  const save = useSetAttendance(note.publicId);
  const named = note.cftTeam.filter((row) => row.member !== null);
  const canRecord = note.allowedActions?.canRecordAttendance === true;
  const form = useForm<AttendanceFormValues>({
    defaultValues: { rows: named.map((row) => ({ functionId: row.functionId, attended: row.attended === true })) },
  });

  const submit = ({ rows }: AttendanceFormValues) => {
    save.mutate(
      { attendance: rows, version: note.version },
      {
        onSuccess: () => { notify.success('Attendance saved.'); },
        onError: failed,
      },
    );
  };

  const columns: SimpleColumn<CftTeamRow>[] = [
    { key: 'function', header: 'Function', render: (row) => row.functionName, width: 220 },
    { key: 'member', header: 'Member', render: (row) => row.member?.name ?? '' },
    {
      key: 'attended',
      header: 'Attended',
      width: 160,
      render: (row) =>
        canRecord ? (
          <FormCheckbox<AttendanceFormValues> name={`rows.${named.indexOf(row)}.attended`} label={`${row.member?.name ?? row.functionName} attended`} />
        ) : row.attended === null ? (
          'Not recorded'
        ) : row.attended ? (
          'Yes'
        ) : (
          'No'
        ),
    },
  ];

  const table = <SimpleTable<CftTeamRow> aria-label="Attendance" rows={named} columns={columns} getRowKey={(row) => row.functionId} emptyTitle="Nobody is named on the CFT" />;

  return (
    <SectionCard title="CFT meeting attendance" subheader={canRecord ? 'Tick who attended the CFT meeting.' : undefined} flush>
      {canRecord ? (
        <Form form={form} onSubmit={submit}>
          {table}
          <Stack direction="row" sx={{ justifyContent: 'flex-end', p: 2 }}>
            <Button type="submit" variant="contained" loading={save.isPending}>
              Save attendance
            </Button>
          </Stack>
        </Form>
      ) : (
        table
      )}
    </SectionCard>
  );
}
