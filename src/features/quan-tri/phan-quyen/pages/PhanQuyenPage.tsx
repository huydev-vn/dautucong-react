import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  startTransition,
} from 'react';
import { Save, Shield, UsersRound } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
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
}

const PhanQuyenCtx = createContext<PhanQuyenCtxValue>({
  selected: new Set(),
  toggle: () => {},
});

function makeKey(idChucNang: number, idTacVu: number): string {
  return `${idChucNang}-${idTacVu}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Module-level sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Checkbox cell — đọc selection từ context, column defs không phụ thuộc selection state */
function TacVuCell({ chucNangId, tacVuId }: { chucNangId: number; tacVuId: number }) {
  const { selected, toggle } = useContext(PhanQuyenCtx);
  const key = makeKey(chucNangId, tacVuId);
  return (
    <input
      type="checkbox"
      checked={selected.has(key)}
      onChange={() => toggle(key)}
      className="h-3.5 w-3.5 cursor-pointer accent-[#1a3c6e]"
      aria-label={`Quyền chức năng ${chucNangId} - tác vụ ${tacVuId}`}
    />
  );
}

/** Select nhóm — gọn, hiển thị inline với tiêu đề qua slot filters của ListPageShell */
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
  return (
    <div className="flex items-center gap-1.5">
      <UsersRound size={13} className="shrink-0 text-[#1a3c6e]/50" />
      <select
        value={selectedId ?? ''}
        disabled={loading}
        onChange={(e) => {
          if (!e.target.value) { onSelect(null); return; }
          const id = Number(e.target.value);
          onSelect(nhomList.find((n) => n.Id === id) ?? null);
        }}
        className={cn(
          'h-8 min-w-[160px] cursor-pointer rounded-lg border border-gray-200 bg-white px-3',
          'text-[12.5px] text-gray-800 transition-colors',
          'focus:border-[#1a3c6e]/40 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/12',
          'disabled:cursor-not-allowed disabled:bg-gray-50',
          !selectedId && 'text-gray-400',
        )}
      >
        <option value="">— Chọn nhóm —</option>
        {nhomList.map((n) => (
          <option key={n.Id} value={n.Id}>
            {n.Ten}
          </option>
        ))}
      </select>
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
    cell: ({ row }) => (
      <span
        className={cn(
          'text-[12.5px]',
          row.depth === 0 ? 'font-semibold text-[#1a3c6e]' : 'text-gray-700',
        )}
      >
        {row.original.Ten}
      </span>
    ),
    meta: { className: 'w-[160px] min-w-[140px] max-w-[200px]' },
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
  const { data: quyenData, isFetching } = useQuyenTheoNhom(nhomId);
  const { mutate: luu, isPending: saving } = useLuuPhanQuyen();

  // Khởi tạo selection từ server khi data tải xong — một lần, không cascade
  // (Component remount theo key khi nhomId đổi → selected tự reset về new Set())
  useEffect(() => {
    if (!quyenData) return;
    startTransition(() => {
      setSelected(new Set(quyenData.map((q) => makeKey(q.IdChucNang, q.IdTacVu))));
    });
  }, [quyenData]);

  const toggle = useCallback((key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const ctxValue = useMemo<PhanQuyenCtxValue>(
    () => ({ selected, toggle }),
    [selected, toggle],
  );

  const columns = useMemo(() => buildColumns(tacVuList), [tacVuList]);

  const handleSave = useCallback(() => {
    const danhSachQuyen = [...selected].map((key) => {
      const [idChucNang, idTacVu] = key.split('-').map(Number);
      return { IdChucNang: idChucNang, IdTacVu: idTacVu };
    });
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
