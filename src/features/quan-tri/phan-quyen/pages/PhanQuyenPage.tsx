import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
} from 'react';
import { Save, Shield, UsersRound, ChevronDown, Check } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { ListPageShell } from '@/components/shared/ListPageShell';
import { TreeTable } from '@/components/shared/TreeTable';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChucNangAll } from '../../chuc-nang/hooks/useChucNang';
import type { ChucNang } from '../../chuc-nang/types/chuc-nang.types';
import { useNhomAll, useTacVuAll, useQuyenTheoNhom, useLuuPhanQuyen } from '../hooks/usePhanQuyen';
import type { Nhom, TacVu } from '../types/phan-quyen.types';

// ─────────────────────────────────────────────────────────────────────────────
// Context — truyền selection state xuống cell mà không làm column defs re-compute
// ─────────────────────────────────────────────────────────────────────────────
interface PhanQuyenCtxValue {
  selected: ReadonlySet<string>;
  toggle: (key: string) => void;
  bulkToggle: (chucNangIds: number[], tacVuId: number, toChecked: boolean) => void;
  setGroupQuyen: (chucNangIds: number[], selectTacVuIds: number[], allTacVuIds: number[]) => void;
  childrenMap: ReadonlyMap<number, number[]>;
}

const PhanQuyenCtx = createContext<PhanQuyenCtxValue>({
  selected: new Set(),
  toggle: () => {},
  bulkToggle: () => {},
  setGroupQuyen: () => {},
  childrenMap: new Map(),
});

function makeKey(idChucNang: number, idTacVu: number): string {
  return `${idChucNang}-${idTacVu}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Module-level sub-components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checkbox cell — đọc selection từ context.
 * Hàng cha: indeterminate khi chọn một phần, cascade click xuống toàn bộ con.
 * Hàng lá: toggle đơn lẻ.
 */
function TacVuCell({ chucNangId, tacVuId }: { chucNangId: number; tacVuId: number }) {
  const { selected, toggle, bulkToggle, childrenMap } = useContext(PhanQuyenCtx);
  const children = childrenMap.get(chucNangId) ?? [];

  if (children.length > 0) {
    const checkedCount = children.filter((cid) => selected.has(makeKey(cid, tacVuId))).length;
    const allChecked = checkedCount === children.length;
    const isIndeterminate = checkedCount > 0 && !allChecked;
    return (
      <input
        type="checkbox"
        checked={allChecked}
        ref={(el) => { if (el) el.indeterminate = isIndeterminate; }}
        onChange={() => bulkToggle(children, tacVuId, !allChecked)}
        className="h-3.5 w-3.5 cursor-pointer accent-[#1a3c6e]"
        aria-label={`Quyền nhóm ${chucNangId} tác vụ ${tacVuId}`}
      />
    );
  }

  const key = makeKey(chucNangId, tacVuId);
  return (
    <input
      type="checkbox"
      checked={selected.has(key)}
      onChange={() => toggle(key)}
      className="h-3.5 w-3.5 cursor-pointer accent-[#1a3c6e]"
      aria-label={`Quyền chức năng ${chucNangId} tác vụ ${tacVuId}`}
    />
  );
}

/** Custom dropdown chọn nhóm — hiển thị cùng hàng với tiêu đề qua slot filters */
function NhomSelect({
  nhomList,
  selectedId,
  onSelect,
  loading,
}: {
  nhomList: Nhom[];
  selectedId: number | null;
  onSelect: (nhom: Nhom | null) => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Đóng khi click bên ngoài
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = nhomList.find((n) => n.Id === selectedId) ?? null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-8 min-w-[180px] cursor-pointer items-center justify-between gap-2 rounded-lg border bg-white px-3 text-[12.5px] transition-colors',
          open
            ? 'border-[#1a3c6e]/40 ring-2 ring-[#1a3c6e]/12'
            : 'border-gray-200 hover:border-[#1a3c6e]/40',
          'disabled:cursor-not-allowed disabled:opacity-60',
        )}
      >
        <div className="flex items-center gap-1.5">
          <UsersRound size={13} className="shrink-0 text-[#1a3c6e]/50" />
          <span className={selected ? 'text-gray-800' : 'text-gray-400'}>
            {selected?.Ten ?? '— Chọn nhóm —'}
          </span>
        </div>
        <ChevronDown
          size={13}
          className={cn('shrink-0 text-gray-400 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
          {nhomList.length === 0 && (
            <div className="px-3 py-2 text-[12px] text-gray-400">Chưa có nhóm nào</div>
          )}
          {nhomList.map((nhom) => {
            const isSelected = selectedId === nhom.Id;
            return (
              <button
                key={nhom.Id}
                type="button"
                onClick={() => { onSelect(nhom); setOpen(false); }}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-[12.5px] transition-colors hover:bg-[#1a3c6e]/[0.05]',
                  isSelected ? 'text-[#1a3c6e]' : 'text-gray-700',
                )}
              >
                <span className="flex w-4 shrink-0 items-center justify-center">
                  {isSelected && <Check size={12} className="text-[#1a3c6e]" />}
                </span>
                <UsersRound size={13} className="shrink-0 text-[#1a3c6e]/50" />
                <span className={isSelected ? 'font-semibold' : ''}>{nhom.Ten}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cell cột Chức năng — tên + 3 nút hành động hàng loạt cho hàng cha
// ─────────────────────────────────────────────────────────────────────────────
interface TenColCellProps {
  row: Row<ChucNang>;
  tacVuList: TacVu[];
}

function TenColCell({ row, tacVuList }: TenColCellProps) {
  const { childrenMap, setGroupQuyen } = useContext(PhanQuyenCtx);
  const chucNangId = row.original.Id;
  const children = childrenMap.get(chucNangId) ?? [];
  const isParent = children.length > 0;

  const allTacVuIds = useMemo(() => tacVuList.map((tv) => tv.Id), [tacVuList]);
  const basicTacVuIds = useMemo(() => {
    const basicMas = new Set(['XEM', 'THEM', 'SUA', 'XOA']);
    return tacVuList.filter((tv) => basicMas.has(tv.Ma)).map((tv) => tv.Id);
  }, [tacVuList]);

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-[12.5px]',
        row.depth === 0 ? 'font-semibold text-[#1a3c6e]' : 'text-gray-700',
      )}
    >
      <span className="flex-1 leading-snug">{row.original.Ten}</span>
      {isParent && (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setGroupQuyen(children, basicTacVuIds, allTacVuIds); }}
            className="cursor-pointer rounded bg-[#1a3c6e]/[0.08] px-1.5 py-0.5 text-[10px] font-medium text-[#1a3c6e] transition-colors hover:bg-[#1a3c6e]/[0.16]"
          >
            Cơ bản
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setGroupQuyen(children, allTacVuIds, allTacVuIds); }}
            className="cursor-pointer rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setGroupQuyen(children, [], allTacVuIds); }}
            className="cursor-pointer rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-500 transition-colors hover:bg-red-100"
          >
            Bỏ chọn
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Column builder — phụ thuộc tacVuList, stable sau khi data load
// ─────────────────────────────────────────────────────────────────────────────
function buildColumns(tacVuList: TacVu[]): ColumnDef<ChucNang>[] {
  const tenCol: ColumnDef<ChucNang> = {
    id: 'ten',
    header: 'Chức năng',
    cell: ({ row }) => <TenColCell row={row} tacVuList={tacVuList} />,
    meta: { className: 'min-w-[280px]' },
  };

  const tacVuCols: ColumnDef<ChucNang>[] = tacVuList.map((tv) => ({
    id: `tv-${tv.Id}`,
    header: () => <span className="text-[12px] font-semibold text-[#1a3c6e]">{tv.Ten}</span>,
    cell: ({ row }) => <TacVuCell chucNangId={row.original.Id} tacVuId={tv.Id} />,
    meta: { align: 'center' as const, className: 'w-[72px] min-w-[60px]' },
  }));

  return [tenCol, ...tacVuCols];
}

// ─────────────────────────────────────────────────────────────────────────────
// PhanQuyenPanel — keyed component, tự remount + reset state khi nhomId thay đổi
// Chỉ có 1 useEffect: khởi tạo selected từ server data (không cascade)
// ─────────────────────────────────────────────────────────────────────────────
function PhanQuyenPanel({
  nhomId,
  nhomName,
  chucNangList,
  tacVuList,
}: {
  nhomId: number;
  nhomName: string;
  chucNangList: ChucNang[];
  tacVuList: TacVu[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Lưu trạng thái gốc từ server để tính diff khi lưu
  const originalRef = useRef<Set<string>>(new Set());
  const { data: quyenData, isFetching } = useQuyenTheoNhom(nhomId);
  const { mutate: luu, isPending: saving } = useLuuPhanQuyen();

  // Map chucNangId → children IDs — cascade checkbox + action buttons
  const childrenMap = useMemo(() => {
    const map = new Map<number, number[]>();
    for (const cn of chucNangList) {
      if (cn.IdCha && cn.IdCha > 0) {
        if (!map.has(cn.IdCha)) map.set(cn.IdCha, []);
        map.get(cn.IdCha)!.push(cn.Id);
      }
    }
    return map;
  }, [chucNangList]);

  // Khởi tạo selection từ server khi data tải xong
  // FIX: backend dùng Id_ChucNang / Id_TacVu (có gạch dưới)
  useEffect(() => {
    if (!quyenData) return;
    const initialSet = new Set(quyenData.map((q) => makeKey(q.Id_ChucNang, q.Id_TacVu)));
    originalRef.current = initialSet;
    startTransition(() => setSelected(new Set(initialSet)));
  }, [quyenData]);

  const toggle = useCallback((key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const bulkToggle = useCallback((chucNangIds: number[], tacVuId: number, toChecked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const cid of chucNangIds) {
        const key = makeKey(cid, tacVuId);
        if (toChecked) next.add(key);
        else next.delete(key);
      }
      return next;
    });
  }, []);

  const setGroupQuyen = useCallback(
    (chucNangIds: number[], selectTacVuIds: number[], allTacVuIds: number[]) => {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const cid of chucNangIds) {
          for (const tvId of allTacVuIds) next.delete(makeKey(cid, tvId));
          for (const tvId of selectTacVuIds) next.add(makeKey(cid, tvId));
        }
        return next;
      });
    },
    [],
  );

  const ctxValue = useMemo<PhanQuyenCtxValue>(
    () => ({ selected, toggle, bulkToggle, setGroupQuyen, childrenMap }),
    [selected, toggle, bulkToggle, setGroupQuyen, childrenMap],
  );

  const columns = useMemo(() => buildColumns(tacVuList), [tacVuList]);

  // Tính diff so với trạng thái gốc rồi gửi ADD/REMOVE để khớp HT_PHANQUYEN_LUU
  const handleSave = useCallback(() => {
    const original = originalRef.current;
    const danhSachQuyen: { Id_ChucNang: number; Id_TacVu: number; action: 'ADD' | 'REMOVE' }[] = [];
    for (const key of selected) {
      if (!original.has(key)) {
        const [idChucNang, idTacVu] = key.split('-').map(Number);
        danhSachQuyen.push({ Id_ChucNang: idChucNang, Id_TacVu: idTacVu, action: 'ADD' });
      }
    }
    for (const key of original) {
      if (!selected.has(key)) {
        const [idChucNang, idTacVu] = key.split('-').map(Number);
        danhSachQuyen.push({ Id_ChucNang: idChucNang, Id_TacVu: idTacVu, action: 'REMOVE' });
      }
    }
    luu({ Id_Nhom: nhomId, DanhSachQuyen: danhSachQuyen });
  }, [nhomId, selected, luu]);

  return (
    <div className="flex flex-col gap-3">
      {/* Subheader: tên nhóm + nút lưu */}
      <div className="flex items-center justify-between rounded-xl border border-[#1a3c6e]/15 bg-[#1a3c6e]/[0.04] px-4 py-2.5">
        <div className="flex items-center gap-2 text-[13px] text-[#1a3c6e]">
          <Shield size={14} className="shrink-0" />
          <span className="font-medium">Đang phân quyền:</span>
          <span className="font-bold">{nhomName}</span>
          {isFetching && <LoadingSpinner size="sm" />}
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="gap-1.5 bg-[#1a3c6e] text-white hover:bg-[#1a3c6e]/90"
        >
          <Save size={13} />
          {saving ? 'Đang lưu...' : 'Lưu phân quyền'}
        </Button>
      </div>

      {/* Tree table phân quyền */}
      <PhanQuyenCtx.Provider value={ctxValue}>
        <TreeTable<ChucNang>
          columns={columns}
          data={chucNangList}
          rowKey="Id"
          parentKey="IdCha"
          defaultExpanded="first-level"
          pageSize={50}
        />
      </PhanQuyenCtx.Provider>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PhanQuyenPage
// ─────────────────────────────────────────────────────────────────────────────
export function PhanQuyenPage() {
  const [selectedNhom, setSelectedNhom] = useState<Nhom | null>(null);

  const { data: nhomData, isLoading: nhomLoading } = useNhomAll();
  const { data: tacVuData, isLoading: tacVuLoading } = useTacVuAll();
  const { data: chucNangData, isLoading: chucNangLoading } = useChucNangAll();

  const nhomList = nhomData ?? [];

  const tacVuList = useMemo(
    () => [...(tacVuData?.Items ?? [])].toSorted((a, b) => (a.Stt ?? 0) - (b.Stt ?? 0)),
    [tacVuData],
  );

  const chucNangList = chucNangData?.Items ?? [];
  const rightPanelLoading = tacVuLoading || chucNangLoading;

  const nhomFilter: ReactNode = (
    <NhomSelect
      nhomList={nhomList}
      selectedId={selectedNhom?.Id ?? null}
      onSelect={setSelectedNhom}
      loading={nhomLoading}
    />
  );

  return (
    <ListPageShell
      title="Phân quyền chức năng"
      description="Thiết lập quyền tác vụ (Xem / Thêm / Sửa / Xóa…) cho từng nhóm người dùng theo chức năng."
      filters={nhomFilter}
    >
      {selectedNhom === null ? (
        <div className="rounded-xl border border-gray-100 bg-white shadow-[0_1px_4px_0_rgba(26,60,110,0.06)]">
          <EmptyState
            icon={<Shield size={30} strokeWidth={1.5} />}
            title="Chọn nhóm để phân quyền"
            description="Nhấn vào một nhóm ở trên để xem và chỉnh sửa phân quyền chức năng."
          />
        </div>
      ) : rightPanelLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : (
        // key={selectedNhom.Id}: component remount khi đổi nhóm → selected tự reset
        <PhanQuyenPanel
          key={selectedNhom.Id}
          nhomId={selectedNhom.Id}
          nhomName={selectedNhom.Ten}
          chucNangList={chucNangList}
          tacVuList={tacVuList}
        />
      )}
    </ListPageShell>
  );
}
