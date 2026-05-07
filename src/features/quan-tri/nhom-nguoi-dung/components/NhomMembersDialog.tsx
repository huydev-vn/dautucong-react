import { useState, useCallback } from 'react';
import { Users, Search, X, UserPlus, Check } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
// NhomMembersDialog: dialog xem thành viên — không phải form → dùng raw Dialog
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// NhomAssignDialog: có hành động "Lưu" → dùng FormDialog từ shared
import { FormDialog } from '@/components/shared/FormDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { HighlightText } from '@/components/shared/HighlightText';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { useNguoiDungList } from '@/features/quan-tri/nguoi-dung';
import {
  useNhomMembersDetail,
  useNhomMemberIds,
  useSetNhomMembers,
} from '../hooks/useNhomNguoiDung';
import type { Nhom, NguoiDungTrongNhomRow } from '../types/nhom-nguoi-dung.types';

// ── NhomAssignDialog — quản lý phân công thành viên ─────────────────────────
// Hiện danh sách TẤT CẢ người dùng (search + phân trang), pre-check những ai đang trong nhóm.
// initialIds truyền từ parent (NhomMembersDialog) → không cần useEffect để sync state.
interface NhomAssignDialogProps {
  open: boolean;
  nhom: Nhom;
  initialIds: number[];
  onClose: () => void;
}

function NhomAssignDialog({ open, nhom, initialIds, onClose }: NhomAssignDialogProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  // Khởi tạo trực tiếp từ prop — component remount mỗi lần assignOpen=true nên không cần reset effect
  const [checkedIds, setCheckedIds] = useState<Set<number>>(() => new Set(initialIds));
  const debouncedSearch = useDebounce(search, 300);

  // useNguoiDungList lấy TẤT CẢ người dùng — không giới hạn theo nhóm
  const { data: pageData, isLoading } = useNguoiDungList(
    { searchText: debouncedSearch || undefined, pageNumber: page, pageSize: DEFAULT_PAGE_SIZE },
  );
  const setMembersMutation = useSetNhomMembers();

  const handleToggle = useCallback((id: number) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleSave = () => {
    setMembersMutation.mutate(
      { idNhom: nhom.Id, userIds: Array.from(checkedIds) },
      { onSuccess: onClose },
    );
  };

  const users = pageData?.Items ?? [];
  const total = pageData?.Total ?? 0;

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSave}
      title={`Phân công thành viên — ${nhom.Ten}`}
      loading={setMembersMutation.isPending}
      submitLabel="Lưu thay đổi"
      size="xl"
    >
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tài khoản, họ tên..."
            className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-7.5 pr-8 text-[12.5px] placeholder:text-gray-400 focus:border-[#1a3c6e]/40 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/12"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Danh sách người dùng với checkbox */}
        <div className="overflow-y-auto rounded-lg border border-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-[12.5px] text-gray-400">Đang tải...</div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-[12.5px] text-gray-400">Không tìm thấy người dùng</div>
          ) : (
            users.map((u, idx) => {
              const checked = checkedIds.has(u.Id);
              return (
                <label
                  key={u.Id}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-gray-50 ${idx < users.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <Checkbox checked={checked} onCheckedChange={() => handleToggle(u.Id)} className="shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-gray-800">{u.TenNguoiDung}</p>
                    <p className="truncate text-[11.5px] text-gray-400">
                      {u.TaiKhoan}{u.Email ? ` · ${u.Email}` : ''}
                    </p>
                  </div>
                  {checked && <Check size={13} className="ml-auto shrink-0 text-green-500" />}
                </label>
              );
            })
          )}
        </div>

        {/* Phân trang mini + đếm đã chọn */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500">
            Đã chọn <strong>{checkedIds.size}</strong> thành viên
          </span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-7 px-2.5 text-[12px]">‹</Button>
            <span className="text-[12px] text-gray-500">Trang {page}</span>
            <Button type="button" variant="outline" size="sm" disabled={page * DEFAULT_PAGE_SIZE >= total} onClick={() => setPage((p) => p + 1)} className="h-7 px-2.5 text-[12px]">›</Button>
          </div>
        </div>
      </div>
    </FormDialog>
  );
}

// ── NhomMembersDialog — xem danh sách thành viên + mở phân công ──────────────
interface NhomMembersDialogProps {
  open: boolean;
  nhom: Nhom | null;
  onClose: () => void;
}

// Columns cho bảng thành viên
function buildMemberColumns(search: string): ColumnDef<NguoiDungTrongNhomRow>[] {
  return [
    {
      id: 'index',
      header: '#',
      meta: { className: 'w-10', align: 'center' },
      cell: ({ row }) => <span className="text-[11.5px] text-gray-400">{row.index + 1}</span>,
    },
    {
      accessorKey: 'TaiKhoan',
      header: 'Tài khoản',
      cell: ({ row }) => (
        <HighlightText
          text={row.original.TaiKhoan}
          highlight={search}
          className="font-mono text-[12.5px] font-medium text-[#1a3c6e]"
        />
      ),
    },
    {
      accessorKey: 'TenNguoiDung',
      header: 'Họ và tên',
      cell: ({ row }) => (
        <HighlightText text={row.original.TenNguoiDung} highlight={search} className="text-[13px] text-gray-800" />
      ),
    },
    {
      accessorKey: 'Email',
      header: 'Email',
      cell: ({ row }) =>
        row.original.Email
          ? <span className="text-[12.5px] text-gray-500">{row.original.Email}</span>
          : <span className="text-gray-300">—</span>,
    },
  ];
}

export function NhomMembersDialog({ open, nhom, onClose }: NhomMembersDialogProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [assignOpen, setAssignOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useNhomMembersDetail(
    { idNhom: nhom?.Id ?? 0, searchText: debouncedSearch || undefined, pageNumber: page, pageSize: DEFAULT_PAGE_SIZE },
    open && !!nhom,
  );
  // Tải trước danh sách thành viên hiện tại của nhóm → truyền vào NhomAssignDialog khi mở
  const { data: memberIds } = useNhomMemberIds(nhom?.Id ?? 0, open && !!nhom);

  const items = data?.Items ?? [];
  const total = data?.Total ?? 0;

  const columns = buildMemberColumns(debouncedSearch);

  if (!nhom) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[15px]">
              <Users size={16} className="text-[#1a3c6e]" />
              Thành viên nhóm — {nhom.Ten}
              <span className="ml-1 rounded-full bg-[#1a3c6e]/10 px-2 py-0.5 text-[11px] font-semibold text-[#1a3c6e]">
                {total}
              </span>
            </DialogTitle>
          </DialogHeader>

          {/* Search + nút phân công */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Tìm trong nhóm..."
                className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-7.5 pr-8 text-[12.5px] placeholder:text-gray-400 focus:border-[#1a3c6e]/40 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/12"
              />
              {search && (
                <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              )}
            </div>
            <Button
              type="button" size="sm"
              onClick={() => setAssignOpen(true)}
              className="shrink-0 bg-[#1a3c6e] text-white hover:bg-[#1a3c6e]/90"
            >
              <UserPlus size={14} className="mr-1.5" />
              Phân công
            </Button>
          </div>

          {/* Bảng thành viên */}
          {!isLoading && items.length === 0 ? (
            <EmptyState
              title="Nhóm chưa có thành viên"
              description={search ? `Không tìm thấy "${search}" trong nhóm` : 'Nhấn "Phân công" để thêm người dùng vào nhóm.'}
            />
          ) : (
            <DataTable
              columns={columns}
              data={items}
              loading={isLoading}
              pageSize={DEFAULT_PAGE_SIZE}
              total={total}
              page={page}
              onPageChange={setPage}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog phân công thành viên — mở chồng trên dialog thành viên.
           Component remount mỗi lần assignOpen=true (conditional render) → state tự reset. */}
      {assignOpen && (
        <NhomAssignDialog
          open={assignOpen}
          nhom={nhom}
          initialIds={memberIds?.Ids ?? []}
          onClose={() => setAssignOpen(false)}
        />
      )}
    </>
  );
}
