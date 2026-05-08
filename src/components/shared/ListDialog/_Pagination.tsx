import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Props ──────────────────────────────────────────────────────────────────────
interface ListPaginationProps {
  /** Current page, 1-based */
  page: number;
  pageCount: number;
  pageSize: number;
  /** Total number of rows (used for "N – M / Total" display) */
  totalRows: number;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────
export function ListPagination({
  page,
  pageCount,
  pageSize,
  totalRows,
  onFirst,
  onPrev,
  onNext,
  onLast,
}: ListPaginationProps) {
  // Hide entirely when everything fits on one page
  if (pageCount <= 1 && totalRows <= pageSize) return null;

  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);
  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <div className="flex shrink-0 items-center justify-between border-t border-gray-100 px-4 py-2.5">
      {/* Record range info */}
      <span className="text-[11.5px] text-gray-400">
        {from}–{to} /{' '}
        <span className="font-medium text-gray-600">{totalRows}</span> bản ghi
      </span>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        <PBtn onClick={onFirst} disabled={!canPrev} title="Trang đầu">
          <ChevronsLeft size={13} />
        </PBtn>
        <PBtn onClick={onPrev} disabled={!canPrev} title="Trang trước">
          <ChevronLeft size={13} />
        </PBtn>

        <span className="min-w-[76px] text-center text-[11.5px] text-gray-600">
          {page} / {pageCount}
        </span>

        <PBtn onClick={onNext} disabled={!canNext} title="Trang sau">
          <ChevronRight size={13} />
        </PBtn>
        <PBtn onClick={onLast} disabled={!canNext} title="Trang cuối">
          <ChevronsRight size={13} />
        </PBtn>
      </div>
    </div>
  );
}

// ── Internal nav button ────────────────────────────────────────────────────────
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
      className={cn(
        'border-gray-200 text-gray-400 disabled:opacity-35',
        'hover:border-[#1a3c6e]/30 hover:bg-[#1a3c6e]/6 hover:text-[#1a3c6e]',
      )}
    >
      {children}
    </Button>
  );
}
