export { HttpClientProvider, useHttpClient, usePlatformApi } from './api/HttpClientContext';
export { createQueryClient, shouldRetry } from './api/queryClient';
export { platformKeys } from './api/platformKeys';
export { useApiVersion, useMasterItems, useMasterOptions, usePeopleSearch } from './api/platformQueries';

export { AuthProvider, useAuth, type AuthContextValue, type CurrentUser } from './auth/AuthProvider';
export { createAuthSession, type AuthSettings } from './auth/createSession';
export { RequirePermission } from './auth/RequirePermission';
export { createDevelopmentSession, createEntraSession, type AuthMode, type AuthSession, type EntraSettings } from './auth/session';

export { ActivityLog, type ActivityEntry } from './components/ActivityLog';
export { Button, LinkButton, type ButtonProps, type LinkButtonProps } from './components/Button';
export { ConfirmDialog, type ConfirmDialogProps } from './components/ConfirmDialog';
export { DataTable, type DataTableProps, type DataTableSort } from './components/DataTable';
export { DateField, type DateFieldProps } from './components/DateField';
export { DetailList, InlineAlert, SectionCard, StatusChip, type DetailItem, type Tone } from './components/display';
export { DocumentList, type DocumentItem, type DocumentListProps } from './components/DocumentList';
export { EmptyState } from './components/EmptyState';
export { ErrorState } from './components/ErrorState';
export { FileUpload, type FileUploadProps } from './components/FileUpload';
export {
  CheckboxField,
  Dropdown,
  Input,
  RadioGroupField,
  TextArea,
  type CheckboxFieldProps,
  type DropdownProps,
  type InputProps,
  type Option,
  type RadioGroupFieldProps,
} from './components/inputs';
export { PageLoader, SectionSkeleton } from './components/Loader';
export { Modal, type ModalProps } from './components/Modal';
export { PageHeader, type Crumb } from './components/PageHeader';
export { Pagination } from './components/Pagination';
export { PeopleListPicker, type PeopleListPickerProps } from './components/PeopleListPicker';
export { PeoplePicker, type PeoplePickerProps, type PersonOption } from './components/PeoplePicker';
export {
  RecordHistoryTabs,
  recordPageSize,
  type RecordExtraTab,
  type RecordHistoryLoaders,
  type RecordHistoryTabsProps,
  type RecordPage,
  type RecordPageRequest,
} from './components/RecordHistoryTabs';
export { FilterBar, SearchField } from './components/SearchFilter';
export { SimpleTable, type SimpleColumn, type SimpleTableProps } from './components/SimpleTable';

export { readAppEnv, type AppEnv, type RawAppEnv } from './config/appEnv';
export { documentUpload } from './config/documentUpload';

export { ErrorBoundary } from './errors/ErrorBoundary';
export { errorMessage } from './errors/errorMessage';

export {
  FormCheckbox,
  FormDatePicker,
  FormDropdown,
  FormFileUpload,
  FormInput,
  FormPeopleList,
  FormPeoplePicker,
  FormRadioGroup,
  FormTextArea,
  type FieldRules,
} from './form/fields';
export { applyServerErrors, Form } from './form/Form';

export { useActionFailure, type ActionFailureOptions } from './hooks/useActionFailure';
export { useDebouncedValue } from './hooks/useDebouncedValue';
export { useDownloadDocument, useFileDownload } from './hooks/useFileDownload';
export { toNumber, useListState, type FilterValues, type ListState } from './hooks/useListState';

export { AppShell, type NavGroup, type NavItem } from './layout/AppShell';
export { NotFoundPage } from './layout/NotFoundPage';
export { UserMenu, type DevUser } from './layout/UserMenu';

export { NotificationProvider, useNotify, type Notifier } from './notifications/NotificationProvider';
export { AppProviders, type AppProvidersProps } from './providers/AppProviders';
export { colors, createAppTheme, layout } from './theme';
