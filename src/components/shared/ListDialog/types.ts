import type { ReactNode } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import type { LucideIcon } from 'lucide-react';

// ── Pagination ─────────────────────────────────────────────────────────────────

export interface ServerPagination {
  type: 'server';
  /** Total number of records across all pages (from API response) */
  total: number;
  /** Current page, 1-based */
  page: number;
  onPageChange: (page: number) => void;
}

export interface ClientPagination {
  type?: 'client';
}

export type PaginationConfig = ServerPagination | ClientPagination;

// ── Tree ───────────────────────────────────────────────────────────────────────

/** Build tree from a flat array where each item references its parent by ID */
export type FlatTreeConfig<TData> = {
  mode: 'flat';
  /** Field name holding the parent row's ID. Root nodes have null/undefined/''. */
  parentKey: keyof TData;
};

/** Data is already a nested array (each item has a children field) */
export type NestedTreeConfig<TData> = {
  mode: 'nested';
  /** Field name holding the children array */
  childrenKey: keyof TData;
};

export type TreeConfig<TData> = FlatTreeConfig<TData> | NestedTreeConfig<TData>;

export type DefaultExpanded = 'none' | 'first-level' | 'all';

// ── Row Actions ────────────────────────────────────────────────────────────────

export interface RowAction<TData> {
  label: string;
  icon?: LucideIcon;
  /** 'danger' renders the button in red. @default 'default' */
  variant?: 'default' | 'danger';
  onClick: (row: TData) => void;
  /** Return true to hide this action for the given row */
  hidden?: (row: TData) => boolean;
  /** Return true to disable this action for the given row */
  disabled?: (row: TData) => boolean;
}

// ── Toolbar ────────────────────────────────────────────────────────────────────

export interface ToolbarConfig {
  onRefresh?: () => void;
  /**
   * Called when user clicks the Export button.
   * Implement your own Excel/CSV logic in the parent component.
   */
  onExport?: () => void;
  onPrint?: () => void;
  /** Show the density (row height) toggle button. @default true */
  showDensityToggle?: boolean;
}

// ── Density ────────────────────────────────────────────────────────────────────

export type Density = 'compact' | 'normal' | 'comfortable';

// ── Dialog size ────────────────────────────────────────────────────────────────

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

// ── Search ─────────────────────────────────────────────────────────────────────

export interface SearchConfig {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /**
   * If set, `onChange` fires after this many ms of inactivity.
   * The input itself updates immediately for a responsive feel.
   */
  debounceMs?: number;
}

// ── Main props ─────────────────────────────────────────────────────────────────

export interface ListDialogProps<TData> {
  // ─ Render mode ────────────────────────────────────────────
  /**
   * `'dialog'` wraps the list in a modal overlay.
   * `'page'`   renders inline (use instead of ListPageShell for richer use cases).
   * @default 'page'
   */
  mode?: 'dialog' | 'page';

  // ─ Dialog-only ────────────────────────────────────────────
  /** Controls modal visibility. Required when `mode='dialog'`. */
  open?: boolean;
  /** Called to close the modal. Required when `mode='dialog'`. */
  onClose?: () => void;
  /** @default 'xl' */
  size?: DialogSize;

  // ─ Header ─────────────────────────────────────────────────
  title: string;
  description?: string;
  /** Number or text badge rendered next to the title (e.g. total record count) */
  badge?: number | string;

  // ─ Data ───────────────────────────────────────────────────
  /** TanStack Table column definitions */
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
  /** Field that uniquely identifies each row */
  rowKey: keyof TData;
  /** Override the empty-state heading */
  emptyTitle?: string;
  /** Override the empty-state body text */
  emptyDescription?: string;

  // ─ Tree ───────────────────────────────────────────────────
  /**
   * Enables hierarchical (tree) display.
   *
   * ```ts
   * // Build tree from flat array
   * tree={{ mode: 'flat', parentKey: 'IdCha' }}
   *
   * // Data already has nested children
   * tree={{ mode: 'nested', childrenKey: 'Children' }}
   * ```
   */
  tree?: TreeConfig<TData>;
  /**
   * Which rows start expanded when data first loads.
   * @default 'first-level'
   */
  defaultExpanded?: DefaultExpanded;

  // ─ Search ─────────────────────────────────────────────────
  /**
   * Search configuration. The component renders the input; the parent is
   * responsible for filtering `data` when `onChange` fires.
   */
  search?: SearchConfig;

  // ─ Filters ────────────────────────────────────────────────
  /** Slot for custom filter controls rendered below the toolbar row */
  filters?: ReactNode;

  // ─ Toolbar actions ────────────────────────────────────────
  /** Slot for primary action buttons (Add, Import…) placed at toolbar right */
  actions?: ReactNode;

  // ─ Row actions ────────────────────────────────────────────
  /**
   * Returns action buttons for a given row, rendered in a sticky right column.
   * Buttons are hidden until the user hovers the row.
   *
   * @example
   * ```ts
   * rowActions={(row) => [
   *   { label: 'Sửa', icon: Pencil, onClick: (r) => openEdit(r) },
   *   { label: 'Xóa', icon: Trash2, variant: 'danger', onClick: (r) => openDelete(r) },
   * ]}
   * ```
   */
  rowActions?: (row: TData) => RowAction<TData>[];

  // ─ Multi-select ───────────────────────────────────────────
  /**
   * Shows a checkbox column for batch operations.
   * Checking a parent node selects all its leaf descendants.
   * Parent shows indeterminate when only some descendants are selected.
   * @default false
   */
  selectable?: boolean;
  /** Controlled set of selected leaf-row IDs (as strings) */
  selectedKeys?: ReadonlySet<string>;
  /** Fires with the full updated selection set */
  onSelectionChange?: (keys: Set<string>) => void;

  // ─ Pagination ─────────────────────────────────────────────
  /**
   * Pagination behaviour.
   * - Omit or `{ type: 'client' }` — TanStack Table paginates in memory.
   * - `{ type: 'server', total, page, onPageChange }` — parent drives the page.
   */
  pagination?: PaginationConfig;
  /** @default 20 */
  pageSize?: number;

  // ─ Sorting ────────────────────────────────────────────────
  /** Click column headers to sort. @default true */
  sortable?: boolean;
  defaultSorting?: SortingState;
  /**
   * `'client'` — TanStack sorts the data in memory.
   * `'server'` — parent receives `onSortChange` and re-fetches.
   * @default 'client'
   */
  sortMode?: 'client' | 'server';
  onSortChange?: (sorting: SortingState) => void;

  // ─ Column resize ──────────────────────────────────────────
  /** Drag column-header borders to resize columns. @default false */
  resizable?: boolean;

  // ─ Toolbar ────────────────────────────────────────────────
  toolbar?: ToolbarConfig;

  // ─ Density ────────────────────────────────────────────────
  /**
   * Controls row height preset.
   * When omitted the component manages density internally via the toolbar toggle.
   */
  density?: Density;
  onDensityChange?: (density: Density) => void;

  // ─ Row interaction ────────────────────────────────────────
  /** Called when the user clicks a row (not its checkboxes or action buttons) */
  onRowClick?: (row: TData) => void;
}
