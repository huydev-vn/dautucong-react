import { useRef, useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { Search, X, Info } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchConfig {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Debounce onChange calls by this many ms. The input display updates immediately. */
  debounceMs?: number;
}

interface ListPageShellProps {
  title: string;
  description?: string;
  badge?: number | string;
  actions?: ReactNode;
  search?: SearchConfig;
  filters?: ReactNode;
  children: ReactNode;
}

export function ListPageShell({
  title,
  description,
  badge,
  actions,
  search,
  filters,
  children,
}: ListPageShellProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Debounced search ─────────────────────────────────────────
  // localValue: hiển thị ngay trong input
  // debouncedLocal: truyền lên onChange sau delay — dùng lại useDebounce có sẵn
  const hasDebounce = !!search?.debounceMs;
  const [localValue, setLocalValue] = useState('');
  const debouncedLocal = useDebounce(localValue, search?.debounceMs ?? 0);

  // Stable ref: luôn giữ onChange mới nhất, tránh stale closure trong effect
  const onChangeRef = useRef(search?.onChange);
  useLayoutEffect(() => { onChangeRef.current = search?.onChange; });

  // Khi giá trị debounced thay đổi → gọi onChange lên parent (bỏ qua lần mount đầu)
  const skipFirstSync = useRef(true);
  useEffect(() => {
    if (!hasDebounce) return;
    if (skipFirstSync.current) { skipFirstSync.current = false; return; }
    onChangeRef.current?.(debouncedLocal);
  }, [debouncedLocal, hasDebounce]);

  // Giá trị thực tế hiển thị trong input
  const displayValue = hasDebounce ? localValue : (search?.value ?? '');

  function handleSearchChange(v: string) {
    if (!search) return;
    if (hasDebounce) { setLocalValue(v); } else { search.onChange(v); }
  }

  function handleSearchClear() {
    if (!search) return;
    if (hasDebounce) setLocalValue('');
    search.onChange(''); // xóa ngay, không chờ debounce
  }

  // ── '/' keyboard shortcut — focus search input ───────────────
  const searchEnabled = !!search;
  useEffect(() => {
    if (!searchEnabled) return;
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
  }, [searchEnabled]);

  return (
    <div className="flex flex-col gap-3">
      {/* ── Header row — no wrap, giữ trên 1 hàng để tránh vertical scroll ── */}
      <div className="flex items-center justify-between gap-3 min-w-0">
        {/* Left: title + badge + tooltip */}
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-[18px] font-bold text-[#1a3c6e] leading-snug">{title}</h1>
          {badge !== undefined && (
            <span className="inline-flex shrink-0 items-center rounded-full bg-[#1a3c6e]/10 px-2 py-0.5 text-[11px] font-semibold text-[#1a3c6e]">
              {badge}
            </span>
          )}
          {description && (
            <div className="group/tip relative flex shrink-0 items-center">
              <span className="flex size-[18px] cursor-default items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-[#1a3c6e]/10 hover:text-[#1a3c6e] transition-colors">
                <Info size={11} />
              </span>
              <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/4 rounded-lg bg-gray-800 px-3 py-2 text-[12px] leading-relaxed text-white shadow-xl opacity-0 transition-opacity group-hover/tip:opacity-100">
                {description}
                <div className="absolute -top-1.5 left-1/4 -translate-x-1/2 border-[6px] border-transparent border-b-gray-800" />
              </div>
            </div>
          )}
        </div>

        {/* Right: search + filters + actions — shrink-0, không bao giờ wrap */}
        <div className="flex shrink-0 items-center gap-2">
          {search && (
            <div className="relative">
              <Search
                size={13}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={inputRef}
                type="text"
                value={displayValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    handleSearchClear();
                    inputRef.current?.blur();
                  }
                }}
                placeholder={search.placeholder ?? 'Tìm kiếm...'}
                className="h-8 w-72 rounded-lg border border-gray-200 bg-white pl-7.5 pr-8 text-[12.5px] text-gray-800 placeholder:text-gray-400 transition-all focus:border-[#1a3c6e]/40 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/12"
              />
              {displayValue ? (
                <button
                  onClick={handleSearchClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={12} />
                </button>
              ) : (
                <kbd
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 select-none leading-none"
                  title="Nhấn / để focus ô tìm kiếm • Esc để xóa"
                >
                  /
                </kbd>
              )}
            </div>
          )}

          {filters}

          {actions}
        </div>
      </div>

      {/* ── Content ── */}
      {children}
    </div>
  );
}
