import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Module augmentation — thêm meta cho column ────────────────
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    /** Tailwind class thêm vào td/th */
    className?: string;
    /** Căn chỉnh nội dung cell */
    align?: 'left' | 'center' | 'right';
  }
}

// ── Props ─────────────────────────────────────────────────────
export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  /** Hiển thị skeleton thay vì dữ liệu */
  loading?: boolean;
  /** Số dòng mỗi trang (mặc định: 10) */
  pageSize?: number;
  /** Tùy chọn số dòng mỗi trang */
  pageSizeOptions?: number[];
  /** Tên trường dùng để lấy row key (mặc định: dùng index) */
  rowKey?: keyof TData;
}

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
                style={{ width: `${40 + ((ri + ci) * 17) % 45}%` }}
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
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex size-7 items-center justify-center rounded-md border border-gray-200 text-gray-400 transition-all hover:border-[#1a3c6e]/30 hover:bg-[#1a3c6e]/6 hover:text-[#1a3c6e] disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

// ── DataTable ─────────────────────────────────────────────────
/**
 * Bảng dữ liệu dùng chung — TanStack Table v8.
 *
 * - Sắp xếp theo cột (client-side)
 * - Phân trang (client-side, auto-reset khi data thay đổi)
 * - Skeleton khi loading
 * - Empty state
 *
 * Việc lọc/tìm kiếm nên xử lý ở component cha rồi truyền `data` đã lọc xuống.
 *
 * @example
 * ```tsx
 * <DataTable columns={nhaThauColumns} data={filteredData} pageSize={10} />
 * ```
 */
export function DataTable<TData>({
  columns,
  data,
  loading = false,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
}: DataTableProps<TData>) {

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: initialPageSize } },
    autoResetPageIndex: true,
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const total = table.getRowModel().rows.length;
  const filteredTotal = data.length;
  const pageCount = table.getPageCount();
  const from = filteredTotal === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, filteredTotal);

  const skeletonCols = loading ? columns.length : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-[0_1px_4px_0_rgba(26,60,110,0.06)]">
        <table className="w-full text-left text-[12.5px]">
          {/* ── Header ── */}
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-gray-200 bg-white">
                {hg.headers.map((header) => {
                  const align = header.column.columnDef.meta?.align ?? 'left';
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'px-3 py-2.5 text-[13px] font-semibold text-[#1a3c6e] whitespace-nowrap',
                        align === 'center' && 'text-center',
                        align === 'right' && 'text-right',
                        header.column.columnDef.meta?.className,
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* ── Body ── */}
          <tbody>
            {loading ? (
              <SkeletonRows rows={Math.min(pageSize, 6)} cols={skeletonCols} />
            ) : total === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <span className="text-4xl">📭</span>
                    <span className="text-sm">Không có dữ liệu phù hợp</span>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-gray-50 transition-colors hover:bg-[#1a3c6e]/[0.025]',
                    i % 2 === 1 && 'bg-gray-50/40',
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const align = cell.column.columnDef.meta?.align ?? 'left';
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          'px-3 py-1.5 text-[12px] text-gray-700',
                          align === 'center' && 'text-center',
                          align === 'right' && 'text-right',
                          cell.column.columnDef.meta?.className,
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {!loading && filteredTotal > 0 && (
        <div className="flex items-center justify-between px-1 text-[12px] text-gray-500">
          {/* Left: chọn số dòng/trang */}
          <div className="flex items-center gap-1.5">
            <span>Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="h-7 cursor-pointer rounded-md border border-gray-200 bg-white px-1.5 text-[12px] text-gray-700 focus:border-[#1a3c6e]/40 focus:outline-none"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>mục / trang</span>
          </div>

          {/* Right: số bản ghi + nút phân trang */}
          <div className="flex items-center gap-3">
            <span>
              <span className="font-semibold text-gray-700">{from}–{to}</span>
              {' '}trong{' '}
              <span className="font-semibold text-gray-700">{filteredTotal}</span>
              {' '}bản ghi
            </span>
            {pageCount > 1 && (
              <div className="flex items-center gap-1">
                <PBtn onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} title="Trang đầu">
                  <ChevronsLeft size={13} />
                </PBtn>
                <PBtn onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} title="Trang trước">
                  <ChevronLeft size={13} />
                </PBtn>
                <span className="min-w-[56px] text-center font-semibold text-[#1a3c6e]">
                  {pageIndex + 1} / {pageCount}
                </span>
                <PBtn onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} title="Trang sau">
                  <ChevronRight size={13} />
                </PBtn>
                <PBtn onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()} title="Trang cuối">
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
