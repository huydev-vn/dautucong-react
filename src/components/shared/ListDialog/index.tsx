import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useLayoutEffect,
  type ReactNode,
} from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
  type ExpandedState,
  type SortingState,
  type CellContext,
} from '@tanstack/react-table';
import {
  X,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { ListToolbar } from './_Toolbar';
import { ListPagination } from './_Pagination';
import {
  buildFlatTree,
  normalizeNested,
  normalizeFlatNoTree,
  computeInitialExpanded,
  collectLeafIds,
  type TreeNode,
} from './_helpers';
import type {
  ListDialogProps,
  Density,
  DialogSize,
  RowAction,
  ServerPagination,
} from './types';

// ── Constants ──────────────────────────────────────────────────────────────────

/** Tailwind class for each row-height density preset */
const DENSITY_TD_CLS: Record<Density, string> = {
  compact: 'py-1.5',
  normal: 'py-2.5',
  comfortable: 'py-4',
};

/** Tailwind max-width class per dialog size */
const DIALOG_SIZE_CLS: Record<DialogSize, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-2xl',
  lg: 'sm:max-w-4xl',
  xl: 'sm:max-w-6xl',
  full: 'sm:max-w-[95vw]',
};

// ── Module-level sub-components ────────────────────────────────────────────────
// Defined at module level (not inside the render function) per project rules.

/** Animated skeleton rows shown while data is loading */
function SkeletonRows({ rows, cols }: { rows: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <tr key={ri} className="border-b border-gray-100">
          {Array.from({ length: cols }).map((_, ci) => (
            <td key={ci} className="px-4 py-2.5">
              <div
                className="h-4 animate-pulse rounded-md bg-gray-100"
                style={{ width: `${40 + (((ri + ci) * 17) % 45)}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/**
 * Renders the expand/collapse toggle + left indent for tree rows.
 * Leaf nodes still receive indent to align text with sibling branches.
 */
function TreeIndent({
  depth,
  canExpand,
  isExpanded,
  onToggle,
  children,
}: {
  depth: number;
  canExpand: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center" style={{ paddingLeft: `${depth * 18}px` }}>
      {canExpand ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="mr-1.5 flex size-4 shrink-0 items-center justify-center rounded text-gray-400 transition-colors hover:text-[#1a3c6e]"
        >
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
      ) : (
        // Invisible spacer — keeps text aligned with expandable siblings
        <span className="mr-1.5 w-4 shrink-0" />
      )}
      {children}
    </div>
  );
}

/**
 * Inline action buttons rendered in the last column on row hover.
 * Buttons stay hidden until the user hovers the row (`group-hover/row` trigger).
 */
function RowActionsCell<TData>({
  row,
  actions,
}: {
  row: TData;
  actions: RowAction<TData>[];
}) {
  const visible = actions.filter((a) => !a.hidden?.(row));
  if (!visible.length) return null;

  return (
    <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100">
      {visible.map((action, i) => (
        <button
          key={i}
          type="button"
          title={action.label}
          disabled={action.disabled?.(row)}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(row);
          }}
          className={cn(
            'flex size-6 items-center justify-center rounded transition-colors',
            'disabled:pointer-events-none disabled:opacity-40',
            action.variant === 'danger'
              ? 'text-red-400 hover:bg-red-50 hover:text-red-600'
              : 'text-gray-400 hover:bg-gray-100 hover:text-[#1a3c6e]',
          )}
        >
          {action.icon && <action.icon size={13} />}
        </button>
      ))}
    </div>
  );
}

// ── Selection cell helpers ─────────────────────────────────────────────────────
// These receive getter functions (not values) so they always read from the
// latest ref without needing `selectedKeys` in the `allColumns` useMemo deps.
// This avoids rebuilding all column defs on every checkbox click.

interface SelectionCellProps {
  /** Returns the leaf IDs for this row (may be the row itself, or all descendants) */
  getLeafIds: () => string[];
  /** Returns the current selection set */
  getSelectedKeys: () => ReadonlySet<string>;
  onToggle: (leafIds: string[], checked: boolean) => void;
}

/** Checkbox for an individual row (including tree-parent rows) */
function SelectionCell({ getLeafIds, getSelectedKeys, onToggle }: SelectionCellProps) {
  const leafIds = getLeafIds();
  const sel = getSelectedKeys();
  const checkedCount = leafIds.filter((id) => sel.has(id)).length;
  const isChecked = leafIds.length > 0 && checkedCount === leafIds.length;
  const isIndeterminate = checkedCount > 0 && checkedCount < leafIds.length;

  return (
    <input
      type="checkbox"
      checked={isChecked}
      ref={(el) => {
        if (el) el.indeterminate = isIndeterminate;
      }}
      onChange={(e) => onToggle(leafIds, e.target.checked)}
      onClick={(e) => e.stopPropagation()}
      className="size-3.5 cursor-pointer accent-[#1a3c6e]"
    />
  );
}

interface SelectionHeaderCellProps {
  /** Returns all leaf IDs across the full dataset */
  getAllLeafIds: () => string[];
  getSelectedKeys: () => ReadonlySet<string>;
  onSelectAll: (checked: boolean) => void;
}

/** "Select all" checkbox in the column header */
function SelectionHeaderCell({
  getAllLeafIds,
  getSelectedKeys,
  onSelectAll,
}: SelectionHeaderCellProps) {
  const allIds = getAllLeafIds();
  const sel = getSelectedKeys();
  const checkedCount = allIds.filter((id) => sel.has(id)).length;
  const isChecked = allIds.length > 0 && checkedCount === allIds.length;
  const isIndeterminate = checkedCount > 0 && checkedCount < allIds.length;

  return (
    <input
      type="checkbox"
      checked={isChecked}
      ref={(el) => {
        if (el) el.indeterminate = isIndeterminate;
      }}
      onChange={(e) => onSelectAll(e.target.checked)}
      className="size-3.5 cursor-pointer accent-[#1a3c6e]"
    />
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * `ListDialog` — universal list container for the entire project.
 *
 * Supports two render modes:
 * - `mode='dialog'` (default when used as a modal lookup/picker)
 * - `mode='page'`   (inline, replaces `ListPageShell` for feature-rich pages)
 *
 * Features:
 * - **Tree**: flat or nested input, expand/collapse, multi-level indent
 * - **Selection**: tree-aware checkboxes (parent = select all leaves)
 * - **Sorting**: client-side or server-side
 * - **Pagination**: client-side (in-memory) or server-side
 * - **Search**: debounced input with `/` shortcut
 * - **Filters**: custom ReactNode slot rendered below toolbar
 * - **Row actions**: hover-reveal buttons in a fixed right column
 * - **Column resize**: drag handles on header cells
 * - **Density**: compact / normal / comfortable row height toggle
 * - **Toolbar**: refresh, export, print, density — all optional callbacks
 *
 * @example — As a dialog picker
 * ```tsx
 * <ListDialog
 *   mode="dialog"
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Chọn nhà thầu"
 *   columns={columns}
 *   data={data}
 *   loading={isLoading}
 *   rowKey="Id"
 *   search={{ value: q, onChange: setQ, debounceMs: 300 }}
 *   pagination={{ type: 'server', total: 250, page, onPageChange: setPage }}
 *   tree={{ mode: 'flat', parentKey: 'IdCha' }}
 *   selectable
 *   selectedKeys={selectedIds}
 *   onSelectionChange={setSelectedIds}
 *   rowActions={(row) => [
 *     { label: 'Sửa', icon: Pencil, onClick: openEdit },
 *     { label: 'Xóa', icon: Trash2, variant: 'danger', onClick: openDelete },
 *   ]}
 *   toolbar={{ onRefresh: refetch, onExport: exportExcel }}
 *   actions={<AddButton />}
 * />
 * ```
 *
 * @example — As an inline page
 * ```tsx
 * <ListDialog
 *   mode="page"
 *   title="Danh sách dự án"
 *   badge={total}
 *   columns={columns}
 *   data={data}
 *   rowKey="Id"
 *   pagination={{ type: 'server', total, page, onPageChange: setPage }}
 * />
 * ```
 */
export function ListDialog<TData>({
  mode = 'page',
  open,
  onClose,
  size = 'xl',
  title,
  description,
  badge,
  columns,
  data,
  loading = false,
  rowKey,
  emptyTitle,
  emptyDescription,
  tree,
  defaultExpanded = 'first-level',
  search,
  filters,
  actions,
  rowActions,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  pagination,
  pageSize = 20,
  sortable = true,
  defaultSorting = [],
  sortMode = 'client',
  onSortChange,
  resizable = false,
  toolbar: toolbarConfig,
  density: densityProp,
  onDensityChange,
  onRowClick,
}: ListDialogProps<TData>) {
  // ── Density (uncontrolled when parent doesn't pass densityProp) ────────────
  const [localDensity, setLocalDensity] = useState<Density>('normal');
  const density = densityProp ?? localDensity;

  function handleDensityChange(d: Density) {
    if (onDensityChange) onDensityChange(d);
    else setLocalDensity(d);
  }

  // ── Sorting ────────────────────────────────────────────────────────────────
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);

  function handleSortChange(
    updater: SortingState | ((old: SortingState) => SortingState),
  ) {
    const next = typeof updater === 'function' ? updater(sorting) : updater;
    setSorting(next);
    onSortChange?.(next);
  }

  // ── Expanded (tree) ────────────────────────────────────────────────────────
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // ── Normalize tree data ────────────────────────────────────────────────────
  const treeData = useMemo<TreeNode<TData>[]>(() => {
    if (!tree) return normalizeFlatNoTree(data);
    if (tree.mode === 'flat') return buildFlatTree(data, rowKey, tree.parentKey);
    return normalizeNested(data, tree.childrenKey);
  }, [data, tree, rowKey]);

  // Re-compute initial expansion whenever the dataset changes
  const prevDataLen = useRef(-1);
  useEffect(() => {
    if (treeData.length !== prevDataLen.current) {
      prevDataLen.current = treeData.length;
      setExpanded(computeInitialExpanded(treeData, defaultExpanded, rowKey));
    }
  }, [treeData, defaultExpanded, rowKey]);

  // ── Stable refs ───────────────────────────────────────────────────────────
  // Updated every render so column-def closures always see the latest values
  // without adding them to the allColumns useMemo dependency array.
  const selectionRef = useRef<ReadonlySet<string>>(selectedKeys ?? new Set());
  const treeDataRef = useRef<TreeNode<TData>[]>(treeData);
  useLayoutEffect(() => {
    selectionRef.current = selectedKeys ?? new Set();
    treeDataRef.current = treeData;
  });

  // ── Selection handlers ─────────────────────────────────────────────────────
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (!onSelectionChange) return;
      if (!checked) {
        onSelectionChange(new Set());
        return;
      }
      const allIds = new Set(
        treeDataRef.current.flatMap((n) => collectLeafIds(n, rowKey)),
      );
      onSelectionChange(allIds);
    },
    [rowKey, onSelectionChange],
  );

  const handleToggleRow = useCallback(
    (leafIds: string[], checked: boolean) => {
      if (!onSelectionChange) return;
      const next = new Set(selectionRef.current);
      if (checked) leafIds.forEach((id) => next.add(id));
      else leafIds.forEach((id) => next.delete(id));
      onSelectionChange(next);
    },
    [onSelectionChange],
  );

  const handleClearSelection = useCallback(() => {
    onSelectionChange?.(new Set());
  }, [onSelectionChange]);

  // ── Build column list ──────────────────────────────────────────────────────
  // Structural columns are stable; selection state is read through refs so
  // changing selectedKeys never triggers a column rebuild.
  const allColumns = useMemo<ColumnDef<TreeNode<TData>>[]>(() => {
    const result: ColumnDef<TreeNode<TData>>[] = [];
    const isTreeMode = !!tree;

    // 1. Checkbox column (optional)
    if (selectable) {
      result.push({
        id: '__select__',
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableResizing: false,
        enableSorting: false,
        header: () => (
          <SelectionHeaderCell
            getAllLeafIds={() =>
              treeDataRef.current.flatMap((n) => collectLeafIds(n, rowKey))
            }
            getSelectedKeys={() => selectionRef.current}
            onSelectAll={handleSelectAll}
          />
        ),
        cell: ({ row }: CellContext<TreeNode<TData>, unknown>) => (
          <SelectionCell
            getLeafIds={() => collectLeafIds(row.original, rowKey)}
            getSelectedKeys={() => selectionRef.current}
            onToggle={handleToggleRow}
          />
        ),
      });
    }

    // 2. User-defined columns
    // In tree mode, the first data column gets the expand/collapse toggle injected.
    const userCols = columns as unknown as ColumnDef<TreeNode<TData>>[];
    if (isTreeMode && userCols.length > 0) {
      const [first, ...rest] = userCols;

      const wrappedFirst: ColumnDef<TreeNode<TData>> = {
        ...first,
        cell: (ctx: CellContext<TreeNode<TData>, unknown>) => {
          // Render the original cell content, then wrap it with the tree indent
          let content: ReactNode;
          if (typeof first.cell === 'function') {
            content = first.cell(ctx) as ReactNode;
          } else if (first.cell != null) {
            content = flexRender(first.cell, ctx) as ReactNode;
          } else {
            // Default TanStack cell: stringify the value
            const val = ctx.getValue();
            content = val != null ? String(val) : '';
          }

          return (
            <TreeIndent
              depth={ctx.row.depth}
              canExpand={ctx.row.getCanExpand()}
              isExpanded={ctx.row.getIsExpanded()}
              onToggle={ctx.row.toggleExpanded}
            >
              {content}
            </TreeIndent>
          );
        },
      };

      result.push(wrappedFirst, ...rest);
    } else {
      result.push(...userCols);
    }

    // 3. Row actions column (optional, fixed right)
    if (rowActions) {
      result.push({
        id: '__actions__',
        size: 80,
        minSize: 60,
        enableResizing: false,
        enableSorting: false,
        header: () => null,
        cell: ({ row }: CellContext<TreeNode<TData>, unknown>) => (
          <RowActionsCell
            row={row.original as TData}
            actions={rowActions(row.original as TData)}
          />
        ),
      });
    }

    return result;
  }, [columns, selectable, rowActions, tree, rowKey, handleSelectAll, handleToggleRow]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const isServer = pagination?.type === 'server';
  const serverPagination = isServer ? (pagination as ServerPagination) : null;

  // Client-side page tracking (server page is driven by the parent)
  const [clientPage, setClientPage] = useState(1);

  // Reset to page 1 when data changes so we never land on a non-existent page
  const prevDataRef = useRef(data);
  useEffect(() => {
    if (data !== prevDataRef.current) {
      prevDataRef.current = data;
      if (!isServer) setClientPage(1);
    }
  }, [data, isServer]);

  const currentPageIndex = (isServer ? (serverPagination!.page) : clientPage) - 1;

  // ── TanStack Table ─────────────────────────────────────────────────────────
  const table = useReactTable<TreeNode<TData>>({
    data: treeData,
    columns: allColumns,
    state: {
      sorting,
      expanded,
      pagination: { pageIndex: currentPageIndex, pageSize },
    },

    // Tree
    getSubRows: (row) => (row.__children.length > 0 ? row.__children : undefined),
    getRowId: (row) => String(row[rowKey]),

    // Pagination
    manualPagination: isServer,
    pageCount: isServer
      ? Math.max(1, Math.ceil(serverPagination!.total / pageSize))
      : undefined,
    onPaginationChange: (updater) => {
      const cur = { pageIndex: currentPageIndex, pageSize };
      const next = typeof updater === 'function' ? updater(cur) : updater;
      if (isServer) {
        serverPagination!.onPageChange(next.pageIndex + 1);
      } else {
        setClientPage(next.pageIndex + 1);
      }
    },

    // Sorting
    manualSorting: sortMode === 'server',
    onSortingChange: handleSortChange,
    enableSorting: sortable,

    // Tree expansion
    onExpandedChange: setExpanded,

    // Column resizing
    enableColumnResizing: resizable,
    columnResizeMode: 'onChange',

    // Row models
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  // ── Derived values ─────────────────────────────────────────────────────────
  const currentPage = isServer ? serverPagination!.page : clientPage;
  const pageCount = table.getPageCount();
  // treeData.length = number of root nodes (pagination navigates over these)
  const totalRows = isServer ? serverPagination!.total : treeData.length;

  const totalLeafCount = useMemo(
    () => treeData.flatMap((n) => collectLeafIds(n, rowKey)).length,
    [treeData, rowKey],
  );
  const selectedCount = selectable ? (selectedKeys?.size ?? 0) : 0;

  // ── Highlight helper — is this row fully selected? ─────────────────────────
  function isRowHighlighted(row: TreeNode<TData>): boolean {
    if (!selectable || !selectedKeys) return false;
    const leafIds = collectLeafIds(row, rowKey);
    return leafIds.length > 0 && leafIds.every((id) => selectedKeys.has(id));
  }

  // ── Table element ──────────────────────────────────────────────────────────
  const tableEl = (
    <div className="min-h-0 flex-1 overflow-auto">
      <table
        className="w-full border-collapse text-[12.5px]"
        style={resizable ? { tableLayout: 'fixed', width: table.getTotalSize() } : undefined}
      >
        {/* ── Sticky header ─────────────────────────────────────── */}
        <thead className="sticky top-0 z-10 bg-[#f7f9fc]">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => {
                const isSortable = header.column.getCanSort();
                const sortDir = header.column.getIsSorted();
                const meta = header.column.columnDef.meta as
                  | { align?: string; className?: string }
                  | undefined;

                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: header.getSize() }}
                    onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                    className={cn(
                      'relative select-none whitespace-nowrap border-b border-gray-200 px-4 py-2.5',
                      'text-[11.5px] font-semibold uppercase tracking-wide text-gray-500',
                      meta?.align === 'center' && 'text-center',
                      meta?.align === 'right' && 'text-right',
                      isSortable && 'cursor-pointer hover:bg-[#f0f4f9] hover:text-[#1a3c6e]',
                      meta?.className,
                    )}
                  >
                    <span className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}

                      {/* Sort indicator */}
                      {isSortable && (
                        <span className="ml-0.5 shrink-0 text-gray-300">
                          {sortDir === 'asc' ? (
                            <ChevronUp size={11} />
                          ) : sortDir === 'desc' ? (
                            <ChevronDown size={11} />
                          ) : (
                            <ArrowUpDown size={11} />
                          )}
                        </span>
                      )}
                    </span>

                    {/* Resize handle (only visible when resizable=true) */}
                    {resizable && header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          'absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none select-none transition-colors',
                          'bg-transparent hover:bg-[#1a3c6e]/25',
                          header.column.getIsResizing() && 'bg-[#1a3c6e]/45',
                        )}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        {/* ── Body ──────────────────────────────────────────────── */}
        <tbody>
          {loading ? (
            <SkeletonRows rows={Math.min(pageSize, 8)} cols={allColumns.length} />
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={allColumns.length}>
                <EmptyState
                  title={emptyTitle ?? 'Không có dữ liệu'}
                  description={emptyDescription ?? 'Chưa có bản ghi nào được tìm thấy.'}
                />
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => {
              const highlighted = isRowHighlighted(row.original);
              return (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original as TData)}
                  className={cn(
                    'group/row border-b border-gray-100 transition-colors',
                    onRowClick && 'cursor-pointer',
                    highlighted ? 'bg-[#1a3c6e]/5' : 'hover:bg-gray-50/80',
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | { align?: string; className?: string }
                      | undefined;

                    return (
                      <td
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                        className={cn(
                          'px-4 text-gray-700',
                          DENSITY_TD_CLS[density],
                          meta?.align === 'center' && 'text-center',
                          meta?.align === 'right' && 'text-right',
                          meta?.className,
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  // ── Shared inner content (toolbar + filters + table + pagination) ──────────
  const innerContent = (
    <>
      <ListToolbar
        search={search}
        actions={actions}
        toolbar={toolbarConfig}
        density={density}
        onDensityChange={handleDensityChange}
        loading={loading}
        selectedCount={selectedCount}
        totalLeafCount={totalLeafCount}
        onClearSelection={handleClearSelection}
      />

      {/* Optional custom filter UI */}
      {filters && (
        <div className="shrink-0 border-b border-gray-100 px-4 py-2">{filters}</div>
      )}

      {tableEl}

      <ListPagination
        page={currentPage}
        pageCount={pageCount}
        pageSize={pageSize}
        totalRows={totalRows}
        onFirst={() => {
          if (isServer) serverPagination!.onPageChange(1);
          else setClientPage(1);
        }}
        onPrev={() => {
          if (isServer) serverPagination!.onPageChange(Math.max(1, currentPage - 1));
          else setClientPage((p) => Math.max(1, p - 1));
        }}
        onNext={() => {
          if (isServer) serverPagination!.onPageChange(Math.min(pageCount, currentPage + 1));
          else setClientPage((p) => Math.min(pageCount, p + 1));
        }}
        onLast={() => {
          if (isServer) serverPagination!.onPageChange(pageCount);
          else setClientPage(pageCount);
        }}
      />
    </>
  );

  // ── Dialog mode ────────────────────────────────────────────────────────────
  if (mode === 'dialog') {
    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) onClose?.(); }}>
        <DialogContent
          className={cn(
            'flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0',
            DIALOG_SIZE_CLS[size],
          )}
          showCloseButton={false}
        >
          {/* Dialog header */}
          <DialogHeader className="flex shrink-0 flex-row items-start justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-[14.5px] font-semibold text-[#1a3c6e]">
                  {title}
                </DialogTitle>
                {badge !== undefined && (
                  <span className="rounded-full bg-[#1a3c6e]/10 px-2 py-0.5 text-[11.5px] font-medium text-[#1a3c6e]">
                    {badge}
                  </span>
                )}
              </div>
              {description && (
                <DialogDescription className="text-[12px] text-gray-400">
                  {description}
                </DialogDescription>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="ml-4 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={15} />
            </button>
          </DialogHeader>

          {/* Scrollable inner area */}
          <div className="flex min-h-0 flex-1 flex-col">{innerContent}</div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Page (inline) mode ─────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_4px_0_rgba(26,60,110,0.06)]">
      {/* Page header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[14.5px] font-semibold text-[#1a3c6e]">{title}</h2>
            {badge !== undefined && (
              <span className="rounded-full bg-[#1a3c6e]/10 px-2 py-0.5 text-[11.5px] font-medium text-[#1a3c6e]">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-0.5 text-[12px] text-gray-400">{description}</p>
          )}
        </div>
      </div>

      {innerContent}
    </div>
  );
}
