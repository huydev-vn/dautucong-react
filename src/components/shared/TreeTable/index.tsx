import {
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
  type ExpandedState,
  type Row,
  type CellContext,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

// ── Internal normalized type ───────────────────────────────────
// WithChildren<T> adds __children to any TData shape
type WithChildren<T> = T & { __children: WithChildren<T>[] };

// ── Types ──────────────────────────────────────────────────────
export type DefaultExpanded = "none" | "first-level" | "all";

export interface TreeTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
  /** Number of root-level rows per page — @default 20 */
  pageSize?: number;
  /** Required: field used as the unique row ID */
  rowKey: keyof TData;
  /**
   * Flat mode: name of the parent-ID field.
   * When provided, TreeTable builds the tree from a flat array.
   * @example parentKey="IdCha"
   */
  parentKey?: keyof TData;
  /**
   * Nested mode: name of the children array field.
   * When provided, data is already hierarchical.
   * @example childrenKey="Children"
   */
  childrenKey?: keyof TData;
  /** @default "first-level" */
  defaultExpanded?: DefaultExpanded;
  /** Show multi-select checkboxes — @default false */
  selectable?: boolean;
  /**
   * Controlled selection (leaf node IDs as strings).
   * Intermediate nodes are computed automatically.
   */
  selectedKeys?: ReadonlySet<string>;
  onSelectionChange?: (keys: Set<string>) => void;
}

// ── Pure helpers (module-level — never inside render) ──────────

/** Flat array → nested tree. Children stored in __children. */
function buildFlatTree<T>(
  items: T[],
  idKey: keyof T,
  parentKey: keyof T,
): WithChildren<T>[] {
  const map = new Map<string, WithChildren<T>>();
  for (const item of items) {
    map.set(String(item[idKey]), { ...item, __children: [] });
  }
  const roots: WithChildren<T>[] = [];
  for (const item of items) {
    const node = map.get(String(item[idKey]))!;
    const parentId = item[parentKey];
    if (parentId != null && parentId !== "" && map.has(String(parentId))) {
      map.get(String(parentId))!.__children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

/** Nested array → normalized (any childrenKey → __children, recursive). */
function normalizeNested<T>(
  items: T[],
  childrenKey: keyof T,
): WithChildren<T>[] {
  return items.map((item) => {
    const kids = (item[childrenKey] as unknown as T[] | undefined) ?? [];
    return { ...item, __children: normalizeNested(kids, childrenKey) };
  });
}

/** No parentKey/childrenKey — treat each item as a root with no children. */
function normalizeFlatNoTree<T>(items: T[]): WithChildren<T>[] {
  return items.map((item) => ({ ...item, __children: [] }));
}

/** Collect all leaf-node IDs in a subtree (for selection). */
function getLeafIds<T>(node: WithChildren<T>, idKey: keyof T): string[] {
  if (!node.__children.length) return [String(node[idKey])];
  return node.__children.flatMap((c) => getLeafIds(c, idKey));
}

/** Compute the initial ExpandedState for a page of roots. */
function computeInitialExpanded<T>(
  roots: WithChildren<T>[],
  mode: DefaultExpanded,
  idKey: keyof T,
): ExpandedState {
  if (mode === "all") return true;
  if (mode === "none") return {};
  // "first-level": expand roots that have children
  const result: Record<string, boolean> = {};
  for (const root of roots) {
    if (root.__children.length > 0) result[String(root[idKey])] = true;
  }
  return result;
}

// ── Sub-components (module-level — never nested inside TreeTable) ──

function IndeterminateCheckbox({
  checked,
  indeterminate,
  onChange,
  className,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  className?: string;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate ?? false;
      }}
      onChange={onChange}
      className={cn(
        "h-[13px] w-[13px] cursor-pointer rounded accent-[#1a3c6e]",
        className,
      )}
    />
  );
}

function TreeSkeletonRows({ rows, cols }: { rows: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <tr key={ri} className="border-b border-gray-100">
          {Array.from({ length: cols }).map((_, ci) => (
            <td key={ci} className="px-3 py-3">
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

function PBtn({
  onClick,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="border-gray-200 text-gray-400 hover:border-[#1a3c6e]/30 hover:bg-[#1a3c6e]/6 hover:text-[#1a3c6e] disabled:opacity-35"
    >
      {children}
    </Button>
  );
}

// ── TreeTable ──────────────────────────────────────────────────
export function TreeTable<TData>({
  columns,
  data,
  loading = false,
  pageSize = 20,
  rowKey,
  parentKey,
  childrenKey,
  defaultExpanded = "first-level",
  selectable = false,
  selectedKeys,
  onSelectionChange,
}: TreeTableProps<TData>) {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // ── 1. Normalize raw data → nested tree ──────────────────────
  const roots = useMemo<WithChildren<TData>[]>(() => {
    if (parentKey) return buildFlatTree(data, rowKey, parentKey);
    if (childrenKey) return normalizeNested(data, childrenKey);
    return normalizeFlatNoTree(data);
  }, [data, rowKey, parentKey, childrenKey]);

  // ── 2. Paginate over root nodes ──────────────────────────────
  const totalRoots = roots.length;
  const pageCount = Math.max(1, Math.ceil(totalRoots / pageSize));
  const pagedRoots = useMemo(
    () => roots.slice((page - 1) * pageSize, page * pageSize),
    [roots, page, pageSize],
  );

  // ── 3. Navigate pages (reset expansion on navigation) ────────
  const goTo = useCallback(
    (p: number) => {
      const newRoots = roots.slice((p - 1) * pageSize, p * pageSize);
      setPage(p);
      setExpanded(computeInitialExpanded(newRoots, defaultExpanded, rowKey));
    },
    [roots, pageSize, defaultExpanded, rowKey],
  );

  // ── 4. Initialize expansion when data loads or page changes ─
  // useEffect is appropriate here: `expanded` is interactive UI state
  // (user can override it); it cannot be derived in render.
  // Runs only when pagedRoots reference changes (data load / page nav).
  useEffect(() => {
    if (pagedRoots.length === 0) return;
    setExpanded(computeInitialExpanded(pagedRoots, defaultExpanded, rowKey));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagedRoots]); // defaultExpanded & rowKey are stable string literals from call sites

  // ── 5. Selection helpers ─────────────────────────────────────
  const allLeafIds = useMemo(
    () => pagedRoots.flatMap((r) => getLeafIds(r, rowKey)),
    [pagedRoots, rowKey],
  );
  const selectedCountOnPage = useMemo(
    () => allLeafIds.filter((id) => selectedKeys?.has(id)).length,
    [allLeafIds, selectedKeys],
  );
  const allSelected =
    selectedCountOnPage === allLeafIds.length && allLeafIds.length > 0;
  const someSelected = selectedCountOnPage > 0 && !allSelected;

  const toggleAll = useCallback(() => {
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys ?? []);
    if (allSelected) allLeafIds.forEach((id) => next.delete(id));
    else allLeafIds.forEach((id) => next.add(id));
    onSelectionChange(next);
  }, [allLeafIds, allSelected, selectedKeys, onSelectionChange]);

  // ── 6. Build internal column defs ────────────────────────────
  const internalColumns = useMemo<ColumnDef<WithChildren<TData>>[]>(() => {
    const typedCols = columns as ColumnDef<WithChildren<TData>>[];
    if (!typedCols.length) return typedCols;

    const [first, ...rest] = typedCols;

    // Wrap first column: prepend indent + expand toggle
    const firstWrapped: ColumnDef<WithChildren<TData>> = {
      ...first,
      cell: (ctx: CellContext<WithChildren<TData>, unknown>) => {
        const { row } = ctx;
        const origCell =
          typeof first.cell === "function"
            ? first.cell(ctx)
            : (first.cell ?? null);
        return (
          <div
            className="flex items-center gap-1"
            style={{ paddingLeft: `${row.depth * 20}px` }}
          >
            <button
              type="button"
              className={cn(
                "shrink-0 rounded p-0.5 transition-colors",
                row.getCanExpand()
                  ? "text-[#1a3c6e]/60 hover:bg-[#1a3c6e]/10 hover:text-[#1a3c6e]"
                  : "invisible pointer-events-none",
              )}
              onClick={row.getCanExpand() ? row.getToggleExpandedHandler() : undefined}
              tabIndex={row.getCanExpand() ? 0 : -1}
              aria-label={row.getIsExpanded() ? "Thu gọn" : "Mở rộng"}
            >
              <ChevronDown
                size={13}
                strokeWidth={2.2}
                className={cn(
                  "transition-transform duration-150",
                  row.getIsExpanded() ? "rotate-0" : "-rotate-90",
                )}
              />
            </button>
            {origCell}
          </div>
        );
      },
    };

    const dataCols: ColumnDef<WithChildren<TData>>[] = [firstWrapped, ...rest];

    if (!selectable) return dataCols;

    // Checkbox column (prepended before data columns)
    const checkboxCol: ColumnDef<WithChildren<TData>> = {
      id: "__select",
      size: 36,
      meta: { align: "center" },
      header: () => (
        <IndeterminateCheckbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={toggleAll}
        />
      ),
      cell: ({ row }: { row: Row<WithChildren<TData>> }) => {
        const leafIds = getLeafIds(row.original, rowKey);
        const checkedCount = leafIds.filter((id) => selectedKeys?.has(id)).length;
        const isChecked = checkedCount === leafIds.length && leafIds.length > 0;
        const isIndet = checkedCount > 0 && !isChecked;
        return (
          <IndeterminateCheckbox
            checked={isChecked}
            indeterminate={isIndet}
            onChange={() => {
              if (!onSelectionChange) return;
              const next = new Set(selectedKeys ?? []);
              if (isChecked) leafIds.forEach((id) => next.delete(id));
              else leafIds.forEach((id) => next.add(id));
              onSelectionChange(next);
            }}
          />
        );
      },
    };

    return [checkboxCol, ...dataCols];
  }, [
    columns,
    selectable,
    allSelected,
    someSelected,
    toggleAll,
    selectedKeys,
    rowKey,
    onSelectionChange,
  ]);

  // ── 7. TanStack table instance ───────────────────────────────
  const table = useReactTable<WithChildren<TData>>({
    data: pagedRoots,
    columns: internalColumns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    // Tell TanStack where to find sub-rows
    getSubRows: (row) => (row.__children.length > 0 ? row.__children : undefined),
    getRowId: (row) => String(row[rowKey]),
    state: { expanded },
    onExpandedChange: setExpanded,
    // Pagination is handled externally (we pass pre-sliced roots)
    manualPagination: true,
  });

  // ── 8. Pagination display ────────────────────────────────────
  const colCount = internalColumns.length;
  const from = totalRoots === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRoots);
  const canPrev = page > 1;
  const canNext = page < pageCount;

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-[0_1px_4px_0_rgba(26,60,110,0.06)]">
        <table className="w-full text-left text-[12.5px]">
          {/* Header */}
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-gray-200 bg-white">
                {hg.headers.map((header) => {
                  const align = header.column.columnDef.meta?.align ?? "left";
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        "px-3 py-2.5 text-[13px] font-semibold text-[#1a3c6e] whitespace-nowrap",
                        align === "center" && "text-center",
                        align === "right" && "text-right",
                        header.column.columnDef.meta?.className,
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              <TreeSkeletonRows rows={Math.min(pageSize, 6)} cols={colCount} />
            ) : totalRoots === 0 ? (
              <tr>
                <td colSpan={colCount}>
                  <EmptyState
                    title="Không có dữ liệu phù hợp"
                    description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc."
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-depth={row.depth}
                  className={cn(
                    "border-b border-gray-50 transition-colors hover:bg-[#1a3c6e]/[0.025]",
                    row.depth === 0 && "bg-white font-medium",
                    row.depth === 1 && "bg-gray-50/40",
                    row.depth > 1 && "bg-gray-50/20",
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const align = cell.column.columnDef.meta?.align ?? "left";
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-3 py-1.5 text-[12px] text-gray-700",
                          align === "center" && "text-center",
                          align === "right" && "text-right",
                          cell.column.columnDef.meta?.className,
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalRoots > 0 && (
        <div className="flex items-center justify-between px-1 text-[12px] text-gray-500">
          {/* Left: page size info */}
          <div className="flex items-center gap-1.5">
            <span>Hiển thị:</span>
            <span className="font-semibold text-gray-700">{pageSize}</span>
            <span>nhóm / trang</span>
          </div>

          {/* Right: record count + navigation */}
          <div className="flex items-center gap-3">
            <span>
              <span className="font-semibold text-gray-700">
                {from}–{to}
              </span>{" "}
              trong{" "}
              <span className="font-semibold text-gray-700">{totalRoots}</span>{" "}
              nhóm
            </span>
            {pageCount > 1 && (
              <div className="flex items-center gap-1">
                <PBtn
                  onClick={() => goTo(1)}
                  disabled={!canPrev}
                  title="Trang đầu"
                >
                  <ChevronsLeft size={13} />
                </PBtn>
                <PBtn
                  onClick={() => goTo(page - 1)}
                  disabled={!canPrev}
                  title="Trang trước"
                >
                  <ChevronLeft size={13} />
                </PBtn>
                <span className="min-w-[56px] text-center font-semibold text-[#1a3c6e]">
                  {page} / {pageCount}
                </span>
                <PBtn
                  onClick={() => goTo(page + 1)}
                  disabled={!canNext}
                  title="Trang sau"
                >
                  <ChevronRight size={13} />
                </PBtn>
                <PBtn
                  onClick={() => goTo(pageCount)}
                  disabled={!canNext}
                  title="Trang cuối"
                >
                  <ChevronsRight size={13} />
                </PBtn>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
