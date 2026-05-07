import { useState, useCallback, useMemo } from 'react';
import { Pencil, Trash2, KeyRound, Eye, ShieldCheck, Shield, Lock, Unlock } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { ListPageShell } from '@/components/shared/ListPageShell';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { HighlightText } from '@/components/shared/HighlightText';
import { TableBadge } from '@/components/shared/TableBadge';
import { AddButton } from '@/components/shared/AddButton';
import { DataTable } from '@/components/shared/DataTable';
import { TableRowActions, type RowActionDef } from '@/components/shared/TableRowActions';
import { cn } from '@/lib/utils';
import { DEFAULT_PAGE_SIZE, CHUC_NANG_IDS, MA_TAC_VU } from '@/utils/constants';
import type { MaTacVu } from '@/utils/constants';
import { useAuthStore } from '@/features/auth';
import { usePermission } from '@/features/auth/hooks/usePermission';
import {
  useNguoiDungList,
  useSaveNguoiDung,
  useDeleteNguoiDung,
  useDatLaiMatKhau,
  useNhomDropdown,
  useDonViDropdown,
} from '../hooks/useNguoiDung';
import { NguoiDungForm } from '../components/NguoiDungForm';
import { DatLaiMatKhauForm } from '../components/DatLaiMatKhauForm';
import { NguoiDungDetailDialog } from '../components/NguoiDungDetailDialog';
import type { NguoiDung, NguoiDungFormValues } from '../types/nguoi-dung.types';

// parse NhomNguoiDungId "[1]" -> [1]
function parseNhomIds(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

// ── Column definitions factory ─────────────────────────────────
// Nhận handlers + context từ page, trả về ColumnDef[]
// Đặt bên ngoài component để không tạo lại mỗi render (dùng useMemo ở page)
function buildColumns(
  search: string,
  page: number,
  nhomMap: Map<number, string>,
  coQuyen: (maTacVu: MaTacVu) => boolean,
  handlers: {
    onDetail: (item: NguoiDung) => void;
    onEdit: (item: NguoiDung) => void;
    onDelete: (item: NguoiDung) => void;
    onResetPassword: (item: NguoiDung) => void;
  },
): ColumnDef<NguoiDung>[] {
  const rowActions: RowActionDef<NguoiDung>[] = [
    { key: 'view',           maTacVu: MA_TAC_VU.XEM, icon: Eye,      variant: 'view',    title: 'Xem chi tiết',      onClick: handlers.onDetail },
    { key: 'reset-password', maTacVu: MA_TAC_VU.SUA, icon: KeyRound, variant: 'warning', title: 'Đặt lại mật khẩu', onClick: handlers.onResetPassword },
    { key: 'edit',           maTacVu: MA_TAC_VU.SUA, icon: Pencil,   variant: 'edit',    title: 'Sửa',               onClick: handlers.onEdit },
    { key: 'delete',         maTacVu: MA_TAC_VU.XOA, icon: Trash2,   variant: 'delete',  title: 'Xóa',               onClick: handlers.onDelete },
  ];

  return [
    {
      id: 'index',
      header: '#',
      meta: { className: 'w-10', align: 'center' },
      cell: ({ row }) => (
        <span className="text-[11.5px] text-gray-400">
          {(page - 1) * DEFAULT_PAGE_SIZE + row.index + 1}
        </span>
      ),
    },
    {
      accessorKey: 'TaiKhoan',
      header: 'Tài khoản',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          {row.original.IsDelete === 1 && <Lock size={12} className="shrink-0 text-red-400" />}
          <HighlightText
            text={row.original.TaiKhoan}
            highlight={search}
            className={cn(
              'font-mono text-[12.5px] font-medium',
              row.original.IsDelete === 1 ? 'text-gray-400 line-through' : 'text-[#1a3c6e]',
            )}
          />
        </div>
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
    {
      id: 'nhom',
      header: 'Nhóm người dùng',
      cell: ({ row }) => {
        const nhomNames = parseNhomIds(row.original.NhomNguoiDungId).map(
          (id) => nhomMap.get(id) ?? `#${id}`,
        );
        return nhomNames.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {nhomNames.map((name) => <TableBadge key={name} label={name} variant="blue" />)}
          </div>
        ) : (
          <span className="text-[11.5px] text-gray-300">Chưa phân nhóm</span>
        );
      },
    },
    {
      id: 'quyen',
      header: 'Quyền',
      meta: { className: 'w-28' },
      cell: ({ row }) =>
        row.original.IsAdmin === 1
          ? <TableBadge label="Admin" variant="indigo" icon={ShieldCheck} />
          : <TableBadge label="Thường" variant="gray" icon={Shield} />,
    },
    {
      id: 'trangThai',
      header: 'Trạng thái',
      meta: { className: 'w-24' },
      cell: ({ row }) =>
        row.original.IsDelete === 1
          ? <TableBadge label="Đã khóa" variant="red" icon={Lock} />
          : <TableBadge label="Hoạt động" variant="green" icon={Unlock} />,
    },
    {
      id: 'actions',
      header: 'Thao tác',
      meta: { className: 'w-32', align: 'right' },
      cell: ({ row }) => (
        <TableRowActions item={row.original} coQuyen={coQuyen} actions={rowActions} />
      ),
    },
  ];
}

// ── Page ───────────────────────────────────────────────────────
export function NguoiDungListPage() {
  const currentUser = useAuthStore((s) => s.user);
  const { coQuyen } = usePermission(CHUC_NANG_IDS.NGUOI_DUNG);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<NguoiDung | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NguoiDung | null>(null);
  const [resetTarget, setResetTarget] = useState<NguoiDung | null>(null);
  const [detailTarget, setDetailTarget] = useState<NguoiDung | null>(null);

  const { data, isLoading } = useNguoiDungList({ pageNumber: page, pageSize: DEFAULT_PAGE_SIZE, searchText: search || undefined });
  const { data: nhomList = [] } = useNhomDropdown();
  const { data: donViList = [] } = useDonViDropdown();

  const saveMutation = useSaveNguoiDung();
  const deleteMutation = useDeleteNguoiDung();
  const resetMutation = useDatLaiMatKhau();

  const items = data?.Items ?? [];
  const total = data?.Total ?? 0;

  const nhomMap = useMemo(() => new Map(nhomList.map((n) => [n.Id, n.Ten])), [nhomList]);

  const handleSearchChange = useCallback((v: string) => { setSearch(v); setPage(1); }, []);
  const handleDetail = useCallback((item: NguoiDung) => setDetailTarget(item), []);
  const handleEdit = useCallback((item: NguoiDung) => { setEditItem(item); setFormOpen(true); }, []);
  const handleDelete = useCallback((item: NguoiDung) => setDeleteTarget(item), []);
  const handleResetPassword = useCallback((item: NguoiDung) => setResetTarget(item), []);
  const handleOpenAdd = useCallback(() => { setEditItem(null); setFormOpen(true); }, []);
  const handleFormClose = useCallback(() => setFormOpen(false), []);

  const handleFormSubmit = useCallback(
    (values: NguoiDungFormValues) => { saveMutation.mutate(values, { onSuccess: () => setFormOpen(false) }); },
    [saveMutation],
  );
  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate({ id: deleteTarget.Id, nguoiThaoTac: currentUser?.TenDangNhap ?? 'admin' }, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, deleteMutation, currentUser]);
  const handleResetConfirm = useCallback(
    (taiKhoan: string, matKhauMoi: string) => { resetMutation.mutate({ taiKhoan, matKhauMoi }, { onSuccess: () => setResetTarget(null) }); },
    [resetMutation],
  );

  // Columns chỉ tạo lại khi search/page/nhomMap/handlers thực sự thay đổi
  const columns = useMemo(
    () => buildColumns(search, page, nhomMap, coQuyen, { onDetail: handleDetail, onEdit: handleEdit, onDelete: handleDelete, onResetPassword: handleResetPassword }),
    [search, page, nhomMap, coQuyen, handleDetail, handleEdit, handleDelete, handleResetPassword],
  );

  return (
    <>
      <ListPageShell
        title="Quản lý người dùng"
        description="Tài khoản và phân quyền hệ thống"
        badge={total}
        search={{ value: search, onChange: handleSearchChange, placeholder: 'Tìm tài khoản, họ tên...', debounceMs: 300 }}
        actions={coQuyen('THEM') ? <AddButton label="Thêm người dùng" onClick={handleOpenAdd} /> : undefined}
      >
        {!isLoading && items.length === 0 && total === 0 ? (
          <EmptyState
            title="Không có người dùng nào"
            description={search ? `Không tìm thấy kết quả cho "${search}"` : 'Nhấn "Thêm người dùng" để bắt đầu.'}
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
      </ListPageShell>

      <NguoiDungDetailDialog
        open={!!detailTarget} item={detailTarget}
        nhomMap={nhomMap} onClose={() => setDetailTarget(null)}
      />

      <NguoiDungForm
        open={formOpen} editItem={editItem}
        nhomOptions={nhomList}
        donViList={donViList}
        loading={saveMutation.isPending}
        onSubmit={handleFormSubmit} onClose={handleFormClose}
      />

      {resetTarget && (
        <DatLaiMatKhauForm
          key={resetTarget.TaiKhoan} open={!!resetTarget}
          taiKhoan={resetTarget.TaiKhoan} loading={resetMutation.isPending}
          onSubmit={handleResetConfirm} onClose={() => setResetTarget(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget} title="Xóa người dùng"
        description={`Bạn có chắc muốn xóa tài khoản "${deleteTarget?.TaiKhoan}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa" loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
