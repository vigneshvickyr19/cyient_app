export { HttpClientProvider, useHttpClient, usePlatformApi } from './api/HttpClientContext';
export type { HttpClient } from '@cyient/api-client';
export { createQueryClient, shouldRetry } from './api/queryClient';
export { platformTags } from './api/api-tags';
export { useMasterItems, useMasterOptions, usePeopleSearch } from './api/platformQueries';

export { AuthProvider, useAuth, type AuthContextValue, type CurrentUser } from './auth/AuthProvider';
export { guarded, lazyNamed, toRelativePath } from './routing';
export { createAuthSession, type AuthSettings } from './auth/createSession';
export { RequirePermission } from './auth/RequirePermission';
export { platformPermissions } from './auth/permissions';
export { createDevelopmentSession, createEntraSession, type AuthMode, type AuthSession, type EntraSettings } from './auth/session';

export { ActivityLog, type ActivityEntry } from './components/activity-log';
export { Button, LinkButton, type ButtonProps, type LinkButtonProps } from './components/button';
export { ConfirmDialog, type ConfirmDialogProps } from './components/confirm-dialog';
export {
  CustomDrawer,
  type CustomDrawerProps,
} from './components/custom-drawer';
export {
  DataTable,
  DataTableHeader,
  CustomDrawer as DataTableFilterDrawer,
  type DataTableProps,
  type DataTableSort,
  type DataTableHeaderProps,
  type ActionButton,
  type DataGridStickyColumnConfig,
  type DataGridStickyColumnSide,
  buildDataGridStickyColumnsGridSx,
} from './components/data-table';
export { DetailList, InlineAlert, SectionCard, StatusChip, type DetailItem, type Tone } from './components/display';
export { DocumentList, type DocumentItem, type DocumentListProps } from './components/document-list';
export { EmptyState, type EmptyStateProps } from './components/empty-state';
export { ErrorState, type ErrorStateProps } from './components/error-state';
export { FileUpload, type FileUploadProps } from './components/file-upload';

export {
  CustomInput,
  CustomInput as Input,
  CustomTextArea,
  CustomTextArea as TextArea,
  type CustomInputProps,
  type CustomTextAreaProps,
} from './components/custom-input';

export {
  CustomSelect,
  CustomSelect as Dropdown,
  type CustomSelectProps,
  type Option,
} from './components/custom-select';

export {
  CustomDatePicker,
  CustomDatePicker as DateField,
  type CustomDatePickerProps,
} from './components/custom-date-picker';

export {
  CustomRadio,
  CustomRadioGroup,
  CustomRadioGroup as RadioGroupField,
  type CustomRadioProps,
  type CustomRadioGroupProps,
} from './components/custom-radio';

export {
  CustomCheckbox,
  CustomCheckbox as CheckboxField,
  type CustomCheckboxProps,
} from './components/custom-checkbox';

export {
  CustomBreadcrumbs,
  type BreadcrumbItem,
  type CustomBreadcrumbsProps,
} from './components/custom-breadcrumbs';
export { PageLoader, SectionSkeleton } from './components/loader';
export { Modal, type ModalProps } from './components/modal';
export { PageHeader, type Crumb } from './components/page-header';
export { Pagination, CustomPagination, type PaginationProps, type CustomPaginationProps } from './components/pagination';
export { PeopleListPicker, type PeopleListPickerProps } from './components/people-list-picker';
export { PeoplePicker, type PeoplePickerProps, type PersonOption } from './components/people-picker';
export {
  RecordHistoryTabs,
  recordPageSize,
  type RecordExtraTab,
  type RecordHistoryLoaders,
  type RecordHistoryTabsProps,
  type RecordPage,
  type RecordPageRequest,
} from './components/record-history-tabs';
export { FilterBar, SearchField, type FilterBarProps, type SearchFieldProps } from './components/search-filter';
export { SegmentedTabs } from './components/segmented-tabs';
export { SimpleTable, type SimpleColumn, type SimpleTableProps } from './components/simple-table';

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
export { useTabState, type UseTabStateOptions, type UseTabStateReturn } from './hooks/useTabState';

export { AppShell, type NavGroup, type NavItem } from './layout/AppShell';
export {
  Sidebar,
  SidebarCollapseButton,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
  SidebarProvider,
  SidebarSearch,
  SidebarSubmenu,
  useSidebar,
  type SidebarProps,
  type SidebarProviderProps,
  type SidebarUserInfo,
} from './layout/sidebar';
export { TopHeader, type TopHeaderProps } from './layout/TopHeader';
export { NotFoundPage } from './layout/NotFoundPage';
export { UserMenu, type DevUser } from './layout/UserMenu';

export { MutationToasts, toastMeta, type MutationToastMeta } from './notifications/MutationToasts';
export { NotificationProvider, useNotify, type Notifier } from './notifications/NotificationProvider';
export { AppProviders, type AppProvidersProps } from './providers/AppProviders';
export { colors, createAppTheme, layout, serifFontFamily, sansFontFamily, typography } from './theme';
