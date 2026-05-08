export { PageHeader } from './PageHeader';
export { LoadingSpinner, LoadingOverlay } from './LoadingSpinner';
export { EmptyState } from './EmptyState';
export { HighlightText } from './HighlightText';
export { TableBadge } from './TableBadge';
export type { TableBadgeVariant } from './TableBadge';
export { ConfirmDialog } from './ConfirmDialog';
export { SkeletonTable, SkeletonCard, SkeletonDetailPage, SkeletonTheme } from './Skeletons';
export { DataTable } from './DataTable';
export { TreeTable } from './TreeTable';
export type { TreeTableProps, DefaultExpanded } from './TreeTable';
export { ListPageShell } from './ListPageShell';
export { NotFoundPage } from './NotFoundPage';
export { ErrorBoundary } from './ErrorBoundary';
export { PermissionGuard } from './PermissionGuard';
export { FormDialog } from './FormDialog';
export { ListDialog } from './ListDialog';
export type { ListDialogProps, RowAction, ToolbarConfig, PaginationConfig, SearchConfig, TreeConfig, Density, DialogSize as ListDialogSize, DefaultExpanded as ListDefaultExpanded } from './ListDialog/types';
export { AddButton } from './AddButton';
export { RowActionButton } from './RowActionButton';
export type { RowActionVariant } from './RowActionButton';
export { TableRowActions } from './TableRowActions';
export type { RowActionDef } from './TableRowActions';
// Form fields — import trực tiếp từ path để tối ưu bundle (rule 2.1)
// VD: import { TextField } from '@/components/shared/Form/TextField';
export {
  FormField,
  FormSection,
  TextField,
  NumberField,
  CurrencyField,
  DateField,
  SelectField,
  SearchSelectField,
  TextareaField,
} from './Form';

// Types
export type { DataTableProps } from './DataTable';
export type { FormFieldProps, SelectOption, SearchSelectOption } from './Form';
