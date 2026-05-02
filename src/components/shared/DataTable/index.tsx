import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

// Module augmentation — them meta cho column
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    /** Tailwind class them vao td/th */
    className?: string;
    /** Can chinh noi dung cell: left | center | right */
    align?: "left" | "center" | "right";
  }
}

// ── Props ─────────────────────────────────────────────────────
interface ClientPaginationProps {
  total?: never;
  page?: never;
  onPageChange?: never;
}

interface ServerPaginationProps {
  /**
   * Total records from API (e.g. 250).
   * When passed, DataTable switches to server-side pagination mode.
   */
  total: number;
  /** Current page (1-based), managed by parent */
  page: number;
  /** Callback when user navigates to a different page */
  onPageChange: (page: number) => void;
}

export type DataTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  rowKey?: keyof TData;
} & (ClientPaginationProps | ServerPaginationProps);

// ── Skeleton rows khi loading ─────────────────────────────────
function SkeletonRows({ rows, cols }: { rows: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <tr key={ri} className="border-b border-gray-100">
          {Array.from({ length: cols }).map((_, ci) => (
            <td key={ci} className="px-4 py-3">
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

// ── Pagination button ─────────────────────────────────────────
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

// ── DataTable ─────────────────────────────────────────────────
/**
 * Bang du lieu dung chung — TanStack Table v8.
 *
 * Ho tro 2 che do phan trang:
 *
 * **Client-side** (mac dinh): truyen `data` day du, table tu phan trang.
 * ```tsx
 * <DataTable columns={cols} data={allItems} pageSize={10} />
 * ```
 *
 * **Server-side**: truyen `total`, `page`, `onPageChange` — table chi render trang hien tai,
 * dieu huong goi callback de component cha fetch trang moi.
 * ```tsx
 * <DataTable
 *   columns={cols}
 *   data={pageItems}
 *   pageSize={DEFAULT_PAGE_SIZE}
 *   total={data.Total}
 *   page={page}
 *   onPageChange={setPage}
 * />
 * ```
 */
export function DataTable<TData>({
  columns,
  data,
  loading = false,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  ...paginationProps
}: DataTableProps<TData>) {
  // Detect server-side mode
  const isServerSide = "total" in paginationProps && paginationProps.total !== undefined;
  const serverTotal = isServerSide ? (paginationProps as ServerPaginationProps).total : 0;
  const serverPage = isServerSide ? (paginationProps as ServerPaginationProps).page : 1;
  const onPageChange = isServerSide ? (paginationProps as ServerPaginationProps).onPageChange : undefined;

  const serverPageCount = isServerSide
    ? Math.max(1, Math.ceil(serverTotal / initialPageSize))
    : 0;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    ...(isServerSide
      ? {
          manualPagination: true,
          pageCount: serverPageCount,
          state: { pagination: { pageIndex: serverPage - 1, pageSize: initialPageSize } },
          onPaginationChange: () => {},
        }
      : {
          initialState: { pagination: { pageSize: initialPageSize } },
          autoResetPageIndex: true,
        }),
  });

  const clientPageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;

  const displayTotal = isServerSide ? serverTotal : data.length;
  const displayPage = isServerSide ? serverPage : clientPageIndex + 1;
  const displayPageCount = isServerSide ? serverPageCount : table.getPageCount();
  const from = displayTotal === 0 ? 0 : (displayPage - 1) * initialPageSize + 1;
  const to = Math.min(displayPage * initialPageSize, displayTotal);

  const canPrev = displayPage > 1;
  const canNext = displayPage < displayPageCount;

  const goTo = (p: number) => {
    if (isServerSide) {
      onPageChange!(p);
    } else {
      table.setPageIndex(p - 1);
    }
  };

  const skeletonCols = loading ? columns.length : 0;

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
              <SkeletonRows rows={Math.min(pageSize, 6)} cols={skeletonCols} />
            ) : displayTotal === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    title="Không có dữ liệu phù hợp"
                    description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc."
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-gray-50 transition-colors hover:bg-[#1a3c6e]/[0.025]",
                    i % 2 === 1 && "bg-gray-50/40",
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
      {!loading && displayTotal > 0 && (
        <div className="flex items-center justify-between px-1 text-[12px] text-gray-500">
          {/* Left: page size selector (client-side only) */}
          <div className="flex items-center gap-1.5">
            <span>Hiển thị:</span>
            {isServerSide ? (
              <span className="font-semibold text-gray-700">{initialPageSize}</span>
            ) : (
              <select
                value={pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="h-7 cursor-pointer rounded-md border border-gray-200 bg-white px-1.5 text-[12px] text-gray-700 focus:border-[#1a3c6e]/40 focus:outline-none"
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            )}
            <span>mục / trang</span>
          </div>

          {/* Right: record count + navigation */}
          <div className="flex items-center gap-3">
            <span>
              <span className="font-semibold text-gray-700">
                {from}–{to}
              </span>{" "}
              trong{" "}
              <span className="font-semibold text-gray-700">
                {displayTotal}
              </span>{" "}
              bản ghi
            </span>
            {displayPageCount > 1 && (
              <div className="flex items-center gap-1">
                <PBtn
                  onClick={() => goTo(1)}
                  disabled={!canPrev}
                  title="Trang đầu"
                >
                  <ChevronsLeft size={13} />
                </PBtn>
                <PBtn
                  onClick={() => goTo(displayPage - 1)}
                  disabled={!canPrev}
                  title="Trang trước"
                >
                  <ChevronLeft size={13} />
                </PBtn>
                <span className="min-w-[56px] text-center font-semibold text-[#1a3c6e]">
                  {displayPage} / {displayPageCount}
                </span>
                <PBtn
                  onClick={() => goTo(displayPage + 1)}
                  disabled={!canNext}
                  title="Trang sau"
                >
                  <ChevronRight size={13} />
                </PBtn>
                <PBtn
                  onClick={() => goTo(displayPageCount)}
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