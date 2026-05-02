export { PageHeader } from './PageHeader';
export { LoadingSpinner, LoadingOverlay } from './LoadingSpinner';
export { EmptyState } from './EmptyState';
export { HighlightText } from './HighlightText';
export { StatusBadge } from './StatusBadge';
export { ConfirmDialog } from './ConfirmDialog';
export { SkeletonTable, SkeletonCard, SkeletonDetailPage, SkeletonTheme } from './Skeletons';
export { DataTable } from './DataTable';
export { ListPageShell } from './ListPageShell';
export { NotFoundPage } from './NotFoundPage';
export { ErrorBoundary } from './ErrorBoundary';
export { FormDialog } from './FormDialog';
export { AddButton } from './AddButton';
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
  TextareaField,
} from './Form';

// Types
export type { DataTableProps } from './DataTable';
export type { FormFieldProps, SelectOption } from './Form';
