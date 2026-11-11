import type { MasterTypeItem } from '@cyient/api-client/platform';
import { Stack } from '@mui/material';
import { useNavigate } from 'react-router';
import { SectionCard } from '@cyient/shared-ui';
import { ErrorState } from '@cyient/shared-ui';
import { SectionSkeleton } from '@cyient/shared-ui';
import { PageHeader } from '@cyient/shared-ui';
import { SimpleTable, type SimpleColumn } from '@cyient/shared-ui';
import { errorMessage } from '@cyient/shared-ui';
import { useAdminPath } from '../shared/AdminBase';
import { useMasterTypes } from './queries';

const columns: readonly SimpleColumn<MasterTypeItem>[] = [
  { key: 'name', header: 'List', render: (type) => type.name },
  { key: 'type', header: 'Key', render: (type) => type.type },
];

/** The master lists that can be maintained; a list opens its items. */
export default function MasterTypesPage() {
  const types = useMasterTypes();
  const navigate = useNavigate();
  const adminPath = useAdminPath();

  return (
    <>
      <PageHeader title="Master lists" subtitle="The choices offered in drop-downs, such as locations and departments." />
      <SectionCard title="Lists" flush>
        {types.isPending ? (
          <Stack sx={{ p: 2 }}>
            <SectionSkeleton />
          </Stack>
        ) : types.isError ? (
          <ErrorState title="We couldn't load the master lists" message={errorMessage(types.error)} onRetry={() => void types.refetch()} />
        ) : (
          <SimpleTable
            aria-label="Master lists"
            rows={types.data}
            columns={columns}
            getRowKey={(type) => type.type}
            onRowClick={(type) => {
              void navigate(adminPath('masters', type.type));
            }}
            emptyTitle="No master lists"
          />
        )}
      </SectionCard>
    </>
  );
}
