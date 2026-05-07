import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { ChevronDown, X, Search, SearchX, Check, Loader2, FolderOpen, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HighlightText } from '@/components/shared/HighlightText';
import { FormField } from './FormField';
import { useDebounce } from '@/hooks/useDebounce';

// ── Public types ───────────────────────────────────────────────

export interface SearchSelectOption {
  value: string | number;
  label: string;
  /**
   * Khi có → component tự suy cấu trúc cây.
   * `null` / `undefined` = node gốc.
   */
  parentValue?: string | number | null;
  disabled?: boolean;
}

// ── Internal type after tree flattening ────────────────────────

interface FlatOption extends SearchSelectOption {
  depth: number;
  hasChildren: boolean;
  childCount: number;
}

// ── Tree builder — module level ────────────────────────────────
// Pure function, never defined inside render. (rule: no inline component/fn)

/**
 * Flat array → DFS-flattened với depth.
 * - Không có parentValue nào → flat mode (depth 0).
 * - Có parentValue → tree mode, ẩn node không match và không có con match.
 * - isRemote = true → bỏ qua filter client-side (server đã lọc).
 */
function flattenOptions(
  options: SearchSelectOption[],
  search: string,
  isRemote: boolean,
): FlatOption[] {
  const hasTree = options.some((o) => o.parentValue != null);

  // ── Flat mode ──────────────────────────────────────────────
  if (!hasTree) {
    const q = search.trim().toLowerCase();
    const filtered =
      !isRemote && q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
    return filtered.map((o) => ({ ...o, depth: 0, hasChildren: false, childCount: 0 }));
  }

  // ── Tree mode ──────────────────────────────────────────────
  const q = search.trim().toLowerCase();
  const valueSet = new Set(options.map((o) => String(o.value)));
  const childrenMap = new Map<string, SearchSelectOption[]>();

  for (const opt of options) {
    const pk = opt.parentValue != null ? String(opt.parentValue) : null;
    if (pk && valueSet.has(pk)) {
      if (!childrenMap.has(pk)) childrenMap.set(pk, []);
      childrenMap.get(pk)!.push(opt);
    }
  }

  const roots = options.filter((o) => {
    const pk = o.parentValue != null ? String(o.parentValue) : null;
    return !pk || !valueSet.has(pk);
  });

  // Check if any descendant matches search
  function subtreeMatches(node: SearchSelectOption): boolean {
    if (node.label.toLowerCase().includes(q)) return true;
    return (childrenMap.get(String(node.value)) ?? []).some(subtreeMatches);
  }

  const result: FlatOption[] = [];

  function flatten(node: SearchSelectOption, depth: number) {
    if (!isRemote && q && !subtreeMatches(node)) return;
    const kids = childrenMap.get(String(node.value)) ?? [];
    result.push({ ...node, depth, hasChildren: kids.length > 0, childCount: kids.length });
    kids.forEach((c) => flatten(c, depth + 1));
  }

  roots.forEach((r) => flatten(r, 0));
  return result;
}

// ── Sub-components — module level (no inline components) ───────

/**
 * Sentinel div — khi visible trong viewport thì gọi `onVisible`.
 * useEffect phù hợp: side effect với browser API (IntersectionObserver).
 */
function LoadMoreSentinel({ onVisible }: { onVisible: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  // Stable ref để tránh re-create observer khi callback thay đổi
  const cb = useRef(onVisible);
  useLayoutEffect(() => {
    cb.current = onVisible;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) cb.current();
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []); // intentional: observer created once, callback kept fresh via ref

  return <div ref={ref} className="h-px" />;
}

interface OptionItemProps {
  opt: FlatOption;
  isSelected: boolean;
  search: string;
  onSelect: (value: string | number) => void;
}

/** Empty state khi không có kết quả */
function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      {search ? (
        <>
          <SearchX size={30} className="text-gray-200" />
          <div>
            <p className="text-[12px] font-medium text-gray-500">Không tìm thấy kết quả</p>
            <p className="mt-0.5 text-[11px] text-gray-400">Thử tìm với từ khóa khác</p>
          </div>
        </>
      ) : (
        <>
          <Inbox size={30} className="text-gray-200" />
          <p className="text-[12px] text-gray-400">Không có dữ liệu</p>
        </>
      )}
    </div>
  );
}

function OptionItem({ opt, isSelected, search, onSelect }: OptionItemProps) {
  const isGroup = opt.hasChildren && opt.depth === 0;

  return (
    <button
      type="button"
      disabled={opt.disabled}
      onClick={() => !opt.disabled && onSelect(opt.value)}
      className={cn(
        'flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2 text-left text-[12.5px] transition-colors',
        'focus-visible:outline-none',
        isGroup
          ? [
              'mt-0.5 first:mt-0 bg-[#eef3fa] font-semibold text-[#1a3c6e]',
              'hover:bg-[#e5edf8]',
              isSelected && 'ring-1 ring-[#1a3c6e]/25 bg-[#dce8f7]',
            ]
          : [
              'hover:bg-[#1a3c6e]/[0.05] focus-visible:bg-[#1a3c6e]/[0.05]',
              isSelected && 'bg-[#1a3c6e]/[0.08] font-medium text-[#1a3c6e]',
            ],
        opt.disabled && 'cursor-not-allowed opacity-40',
      )}
      style={{ paddingLeft: isGroup ? '8px' : `${8 + opt.depth * 16}px` }}
    >
      {/* Icon nhóm cha */}
      {isGroup && (
        <FolderOpen size={13} className="shrink-0 text-[#1a3c6e]/50" />
      )}

      {/* Ký tự nối cho node con */}
      {!isGroup && opt.depth > 0 && (
        <span className="shrink-0 select-none text-[11px] font-normal leading-none text-gray-300">└─</span>
      )}

      <HighlightText text={opt.label} highlight={search} className="flex-1 truncate" />

      {/* Badge số lượng con */}
      {isGroup && (
        <span className="ml-auto shrink-0 rounded-full bg-[#1a3c6e]/10 px-1.5 py-px text-[10px] font-medium text-[#1a3c6e]/60">
          {opt.childCount}
        </span>
      )}

      {isSelected && (
        <Check size={12} className={cn('shrink-0 text-[#1a3c6e]', isGroup ? 'ml-1' : 'ml-auto')} />
      )}
    </button>
  );
}

// ── Props ──────────────────────────────────────────────────────

export interface SearchSelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  /** Placeholder khi chưa chọn */
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  className?: string;

  /**
   * Danh sách option.
   * - Flat: `{ value, label }[]`
   * - Tree: `{ value, label, parentValue }[]` — component tự suy cây
   */
  options: SearchSelectOption[];

  /** Cho phép xóa lựa chọn (hiện nút ✕) */
  clearable?: boolean;

  /**
   * Remote search callback (debounce 300ms built-in).
   * Khi truyền vào → không filter client-side, server chịu trách nhiệm lọc.
   *
   * @example
   * ```tsx
   * const [search, setSearch] = useState('');
   * const { data } = useQuery({ queryKey: [..., search], queryFn: () => api.search(search) });
   * <SearchSelectField onSearch={setSearch} ... />
   * ```
   */
  onSearch?: (search: string) => void;

  /**
   * Infinite scroll — truyền đủ 3 props để kích hoạt.
   * Thường lấy từ `useInfiniteQuery`.
   *
   * @example
   * ```tsx
   * const q = useInfiniteQuery({ ... });
   * const options = q.data?.pages.flatMap(p => p.Items.map(toOption)) ?? [];
   * <SearchSelectField
   *   options={options}
   *   fetchNextPage={q.fetchNextPage}
   *   hasNextPage={q.hasNextPage}
   *   isFetchingNextPage={q.isFetchingNextPage}
   * />
   * ```
   */
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;

  /** Loading state khi fetch lần đầu */
  isLoading?: boolean;
}

// ── SearchSelectField ──────────────────────────────────────────

/**
 * Select nâng cao tích hợp React Hook Form.
 *
 * **Features:**
 * - Tìm kiếm với highlight kết quả (`HighlightText`)
 * - Hiển thị cấu trúc cây cha/con (tự suy từ `parentValue`)
 * - Infinite scroll khi truyền `fetchNextPage` + `hasNextPage`
 * - Remote search khi truyền `onSearch`
 * - Xóa lựa chọn với `clearable`
 *
 * @example Flat, local options (thay thế SelectField khi cần search)
 * ```tsx
 * <SearchSelectField
 *   control={form.control} name="loaiGoiThauId"
 *   label="Loại gói thầu"
 *   options={loaiGoiThauOptions}
 * />
 * ```
 *
 * @example Tree structure (cha/con)
 * ```tsx
 * <SearchSelectField
 *   control={form.control} name="idCha"
 *   label="Chức năng cha"
 *   clearable
 *   options={items.map(c => ({ value: c.Id, label: c.Ten, parentValue: c.IdCha }))}
 * />
 * ```
 *
 * @example Remote + infinite scroll
 * ```tsx
 * const q = useInfiniteQuery({ queryKey: [KEY, search], queryFn: ... });
 * const options = q.data?.pages.flatMap(p => p.Items.map(toOption)) ?? [];
 * <SearchSelectField
 *   control={form.control} name="duAnId"
 *   label="Dự án"
 *   options={options}
 *   onSearch={setSearch}
 *   fetchNextPage={q.fetchNextPage}
 *   hasNextPage={q.hasNextPage}
 *   isFetchingNextPage={q.isFetchingNextPage}
 *   isLoading={q.isLoading}
 * />
 * ```
 */
export function SearchSelectField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = 'Chọn...',
  required,
  disabled,
  hint,
  className,
  options,
  clearable,
  onSearch,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
}: SearchSelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isRemote = !!onSearch;
  const debouncedSearch = useDebounce(search, 300);

  // Trigger remote search khi debounced value thay đổi.
  // useEffect phù hợp: side effect gọi callback bên ngoài sau async delay.
  const onSearchRef = useRef(onSearch);
  useLayoutEffect(() => {
    onSearchRef.current = onSearch;
  });
  useEffect(() => {
    if (isRemote) onSearchRef.current?.(debouncedSearch);
  }, [debouncedSearch, isRemote]);

  // Reset search khi đóng dropdown
  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setSearch('');
  }, []);

  // Focus ô tìm kiếm khi mở dropdown
  // useEffect phù hợp: side effect focus DOM sau khi Popover animation xong
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchInputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  // Build flattened options — memoized, chỉ recompute khi deps thay đổi
  const flatOptions = useMemo(
    () => flattenOptions(options, isRemote ? '' : search, isRemote),
    [options, search, isRemote],
  );

  // Label của giá trị đang được chọn
  const getLabel = useCallback(
    (value: unknown): string => {
      if (value == null || value === '') return '';
      return options.find((o) => String(o.value) === String(value))?.label ?? String(value);
    },
    [options],
  );

  const handleFetchMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage?.();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedLabel = getLabel(field.value);
        const hasValue = field.value != null && field.value !== '';

        const handleSelect = (value: string | number) => {
          // Toggle off nếu click lại cùng giá trị khi clearable
          field.onChange(
            clearable && String(value) === String(field.value) ? null : value,
          );
          setOpen(false);
          setSearch('');
        };

        const handleClear = (e: React.MouseEvent | React.KeyboardEvent) => {
          e.stopPropagation();
          field.onChange(null);
        };

        return (
          <FormField
            label={label}
            required={required}
            error={fieldState.error?.message}
            hint={hint}
            className={className}
          >
            <Popover open={open} onOpenChange={handleOpenChange}>
              {/* Trigger — dùng div để tránh nested <button> khi có clear btn */}
              <PopoverTrigger asChild disabled={disabled}>
                <div
                  role="combobox"
                  tabIndex={disabled ? -1 : 0}
                  aria-expanded={open}
                  aria-haspopup="listbox"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (!disabled) setOpen((prev) => !prev);
                    }
                    if (e.key === 'Escape') setOpen(false);
                  }}
                  className={cn(
                    'flex h-8 w-full cursor-pointer items-center justify-between gap-1.5 rounded-lg border border-gray-200 bg-white px-3',
                    'text-[12.5px] transition-colors select-none',
                    'hover:border-gray-300 focus:outline-none focus:border-[#1a3c6e]/40 focus:ring-2 focus:ring-[#1a3c6e]/12',
                    open && 'border-[#1a3c6e]/40 ring-2 ring-[#1a3c6e]/12',
                    fieldState.error && 'border-red-300 focus:border-red-300 focus:ring-red-100/50',
                    disabled && 'cursor-not-allowed bg-gray-50 opacity-70',
                  )}
                >
                  <span
                    className={cn(
                      'flex-1 truncate',
                      hasValue ? 'text-gray-800' : 'text-gray-400',
                    )}
                  >
                    {hasValue ? selectedLabel : placeholder}
                  </span>

                  <span className="flex shrink-0 items-center gap-0.5">
                    {/* Clear button — TRONG trigger div, nhưng stopPropagation để không toggle popover */}
                    {clearable && hasValue && !disabled && (
                      <span
                        role="button"
                        tabIndex={-1}
                        aria-label="Xóa lựa chọn"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={handleClear}
                        onKeyDown={(e) => e.key === 'Enter' && handleClear(e)}
                        className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <X size={11} />
                      </span>
                    )}
                    <ChevronDown
                      size={13}
                      className={cn(
                        'text-gray-400 transition-transform duration-150',
                        open && 'rotate-180',
                      )}
                    />
                  </span>
                </div>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                sideOffset={4}
                // gap-0 override default gap-2.5 từ base PopoverContent
                className="flex flex-col gap-0 overflow-hidden p-0"
                style={{
                  width: 'var(--radix-popover-trigger-width)',
                  minWidth: '180px',
                  maxHeight: 'min(var(--radix-popover-content-available-height, 360px), 360px)',
                }}
                // Không cho PopoverContent steal focus — ta tự focus searchInput
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                {/* ── Search input — cố định, không cuộn ───────── */}
                <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 px-2.5 py-2">
                  <Search size={13} className="shrink-0 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="flex-1 bg-transparent text-[12.5px] text-gray-800 placeholder-gray-400 outline-none"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>

                {/* ── Options list — cuộn được ──────────────────── */}
                {/* min-h-0 + flex-1: bắt buộc để overflow-y-auto hoạt động trong flex container */}
                <div
                  role="listbox"
                  aria-label={label}
                  className="min-h-0 flex-1 overflow-y-auto p-1"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-[12px] text-gray-400">
                      <Loader2 size={14} className="animate-spin" />
                      Đang tải...
                    </div>
                  ) : flatOptions.length === 0 ? (
                    <EmptyState search={search} />
                  ) : (
                    <>
                      {flatOptions.map((opt) => (
                        <OptionItem
                          key={opt.value}
                          opt={opt}
                          isSelected={String(opt.value) === String(field.value)}
                          search={search}
                          onSelect={handleSelect}
                        />
                      ))}

                      {/* Infinite scroll sentinel — xuất hiện khi cuộn đến cuối */}
                      {fetchNextPage && hasNextPage && (
                        <LoadMoreSentinel onVisible={handleFetchMore} />
                      )}

                      {isFetchingNextPage && (
                        <div className="flex items-center justify-center gap-1.5 py-2 text-[11.5px] text-gray-400">
                          <Loader2 size={12} className="animate-spin" />
                          Đang tải thêm...
                        </div>
                      )}
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </FormField>
        );
      }}
    />
  );
}
