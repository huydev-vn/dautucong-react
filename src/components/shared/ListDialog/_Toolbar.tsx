import { useRef, useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import {
  Search,
  X,
  RefreshCw,
  Download,
  Printer,
  AlignJustify,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import type { SearchConfig, ToolbarConfig, Density } from './types';

// ── Density label map ──────────────────────────────────────────────────────────
const DENSITY_LABEL: Record<Density, string> = {
  compact: 'Compact',
  normal: 'Normal',
  comfortable: 'Thoải mái',
};

const DENSITY_CYCLE: Density[] = ['compact', 'normal', 'comfortable'];

// ── Props ──────────────────────────────────────────────────────────────────────
interface ListToolbarProps {
  search?: SearchConfig;
  /** Slot for primary action buttons (Add, Import…) */
  actions?: ReactNode;
  toolbar?: ToolbarConfig;
  density: Density;
  onDensityChange: (d: Density) => void;
  loading?: boolean;
  /** How many rows are currently selected */
  selectedCount: number;
  /** Total number of selectable leaf rows */
  totalLeafCount: number;
  /** Clears the entire selection */
  onClearSelection: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────
export function ListToolbar({
  search,
  actions,
  toolbar,
  density,
  onDensityChange,
  loading,
  selectedCount,
  totalLeafCount,
  onClearSelection,
}: ListToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Debounced search ──────────────────────────────────────────────────────
  // localValue: reflects the input immediately
  // debouncedLocal: fires onChange only after the user stops typing
  const hasDebounce = !!search?.debounceMs;
  const [localValue, setLocalValue] = useState('');
  const debouncedLocal = useDebounce(localValue, search?.debounceMs ?? 0);

  // Stable ref to the latest onChange — avoids a stale closure inside useEffect
  const onChangeRef = useRef(search?.onChange);
  useLayoutEffect(() => {
    onChangeRef.current = search?.onChange;
  });

  // Skip the very first mount, then call onChange after each debounce tick
  const skipFirst = useRef(true);
  useEffect(() => {
    if (!hasDebounce) return;
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    onChangeRef.current?.(debouncedLocal);
  }, [debouncedLocal, hasDebounce]);

  const displayValue = hasDebounce ? localValue : (search?.value ?? '');

  function handleChange(v: string) {
    if (!search) return;
    if (hasDebounce) setLocalValue(v);
    else search.onChange(v);
  }

  function handleClear() {
    if (!search) return;
    if (hasDebounce) setLocalValue('');
    search.onChange(''); // clear immediately — no debounce delay on clear
  }

  // ── '/' keyboard shortcut — focus search ──────────────────────────────────
  useEffect(() => {
    if (!search) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (
        e.key === '/' &&
        document.activeElement !== inputRef.current &&
        tag !== 'INPUT' &&
        tag !== 'TEXTAREA' &&
        tag !== 'SELECT'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [search]);

  // ── Density toggle (cycles: compact → normal → comfortable → compact) ─────
  function cycleDensity() {
    const idx = DENSITY_CYCLE.indexOf(density);
    onDensityChange(DENSITY_CYCLE[(idx + 1) % DENSITY_CYCLE.length]);
  }

  const showDensityToggle = toolbar?.showDensityToggle !== false;

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 px-4 py-2.5">
      {/* Search input */}
      {search && (
        <div className="relative min-w-0 flex-1" style={{ maxWidth: 280 }}>
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={search.placeholder ?? 'Tìm kiếm... (/)'}
            className={cn(
              'h-8 w-full rounded-md border border-gray-200 bg-white pl-8 pr-7 text-[12.5px]',
              'placeholder:text-gray-400',
              'transition-colors focus:border-[#1a3c6e]/40 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/10',
            )}
          />
          {displayValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* Selection badge — shows "Đã chọn X/N" when rows are checked */}
      {selectedCount > 0 && (
        <span className="flex items-center gap-1.5 rounded-full bg-[#1a3c6e]/8 px-2.5 py-1 text-[11.5px] font-medium text-[#1a3c6e]">
          Đã chọn {selectedCount}/{totalLeafCount}
          <button
            type="button"
            onClick={onClearSelection}
            title="Bỏ chọn tất cả"
            className="ml-0.5 rounded text-[#1a3c6e]/60 hover:text-[#1a3c6e]"
          >
            <X size={11} />
          </button>
        </span>
      )}

      {/* Push remaining items to the right */}
      <div className="flex-1" />

      {/* Primary actions slot (Add button, Import…) */}
      {actions}

      {/* Utility icon buttons */}
      <div className="flex items-center gap-0.5">
        {toolbar?.onRefresh && (
          <UtilButton
            onClick={toolbar.onRefresh}
            disabled={loading}
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </UtilButton>
        )}

        {toolbar?.onExport && (
          <UtilButton onClick={toolbar.onExport} title="Xuất Excel">
            <Download size={13} />
          </UtilButton>
        )}

        {toolbar?.onPrint && (
          <UtilButton onClick={toolbar.onPrint} title="In danh sách">
            <Printer size={13} />
          </UtilButton>
        )}

        {showDensityToggle && (
          <UtilButton
            onClick={cycleDensity}
            title={`Mật độ dòng: ${DENSITY_LABEL[density]}`}
            active={density !== 'normal'}
          >
            <AlignJustify size={13} />
          </UtilButton>
        )}
      </div>
    </div>
  );
}

// ── Internal utility icon button ───────────────────────────────────────────────
function UtilButton({
  onClick,
  disabled,
  title,
  active,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'flex size-7 items-center justify-center rounded-md transition-colors',
        'disabled:pointer-events-none disabled:opacity-40',
        active
          ? 'bg-[#1a3c6e]/10 text-[#1a3c6e]'
          : 'text-gray-400 hover:bg-gray-100 hover:text-[#1a3c6e]',
      )}
    >
      {children}
    </button>
  );
}
