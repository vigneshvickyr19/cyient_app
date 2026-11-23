import { NotFoundPage, RequirePermission, useAuth } from '@cyient/shared-ui';
import { AdminArea } from '@cyient/shared-ui/admin';
import { lazy, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { manageNotePermissions, permissions, viewNotes } from '@/constants/permissions';
import { AppLayout } from '@/layouts/AppLayout';
import { ROUTES } from '@/routes/paths';

const NotesPage = lazy(() => import('@/views/notes/list/NotesPage').then((m) => ({ default: m.NotesPage })));
const PendingPage = lazy(() => import('@/views/pending/PendingPage').then((m) => ({ default: m.PendingPage })));
const NoteDetailsPage = lazy(() => import('@/views/notes/detail/NoteDetailsPage').then((m) => ({ default: m.NoteDetailsPage })));
const NewNotePage = lazy(() => import('@/views/notes/form/NoteFormPage').then((m) => ({ default: m.NewNotePage })));
const EditNotePage = lazy(() => import('@/views/notes/form/NoteFormPage').then((m) => ({ default: m.EditNotePage })));
const TrackerPage = lazy(() => import('@/views/reports/tracker/TrackerPage').then((m) => ({ default: m.TrackerPage })));
const ReportPage = lazy(() => import('@/views/reports/report/ReportPage').then((m) => ({ default: m.ReportPage })));
const TasksPage = lazy(() => import('@/views/manage/tasks/TasksPage').then((m) => ({ default: m.TasksPage })));
const ManageNotesPage = lazy(() => import('@/views/manage/notes/list/ManageNotesPage').then((m) => ({ default: m.ManageNotesPage })));
const ManageNotePage = lazy(() => import('@/views/manage/notes/detail/ManageNotePage').then((m) => ({ default: m.ManageNotePage })));
const CustomersPage = lazy(() => import('@/views/manage/customers/CustomersPage').then((m) => ({ default: m.CustomersPage })));
const CftFunctionsPage = lazy(() => import('@/views/manage/cft-functions/CftFunctionsPage').then((m) => ({ default: m.CftFunctionsPage })));

const guard = (anyOf: readonly string[], page: ReactNode) => <RequirePermission anyOf={anyOf}>{page}</RequirePermission>;

/** The ECN app's pages, for ECNs and TCNs alike. Addresses match the API's email links: /ecn/notes/{id}. */
export function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to={user.pendingCount ? ROUTES.pending : ROUTES.notes} replace />} />
        <Route path="pending" element={guard(viewNotes, <PendingPage />)} />
        <Route path="notes" element={guard(viewNotes, <NotesPage key="InProgress" view="InProgress" />)} />
        <Route path="closed" element={guard(viewNotes, <NotesPage key="Closed" view="Closed" />)} />
        <Route path="search" element={guard(viewNotes, <NotesPage key="All" view="All" />)} />
        <Route path="notes/new" element={guard([permissions.create], <NewNotePage />)} />
        {/* Named people (CFT members, Reviewer, Approver) open their note even without ecn.note.view, as the API allows */}
        <Route path="notes/:publicId" element={<NoteDetailsPage />} />
        <Route path="notes/:publicId/edit" element={guard([permissions.create], <EditNotePage />)} />
        <Route path="tracker" element={guard([permissions.export], <TrackerPage />)} />
        <Route path="report" element={guard(viewNotes, <ReportPage />)} />
        <Route path="manage/tasks" element={guard([permissions.manageTasks], <TasksPage />)} />
        <Route path="manage/notes" element={guard(manageNotePermissions, <ManageNotesPage />)} />
        <Route path="manage/notes/:publicId" element={guard(manageNotePermissions, <ManageNotePage />)} />
        <Route path="manage/customers" element={guard([permissions.manageCustomers], <CustomersPage />)} />
        <Route path="manage/cft-functions" element={guard([permissions.manageMasters], <CftFunctionsPage />)} />
        <Route path="admin/*" element={<AdminArea />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
