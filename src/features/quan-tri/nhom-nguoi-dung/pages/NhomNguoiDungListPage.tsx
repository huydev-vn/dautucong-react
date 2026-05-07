import { useState, useCallback, useMemo } from 'react';
import { Pencil, Trash2, Users } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { ListPageShell } from '@/components/shared/ListPageShell';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { HighlightText } from '@/components/shared/HighlightText';
import { AddButton } from '@/components/shared/AddButton';
import { DataTable } from '@/components/shared/DataTable';
import { TableRowActions, type RowActionDef } from '@/components/shared/TableRowActions';
import { DEFAULT_PAGE_SIZE, CHUC_NANG_IDS, MA_TAC_VU } from '@/utils/constants';
import type { MaTacVu } from '@/utils/constants';
import { usePermission } from '@/features/auth/hooks/usePermission';
import { useNhomList, useSaveNhom, useDeleteNhom, useMyNhomIds } from '../hooks/useNhomNguoiDung';
import { NhomForm } from '../components/NhomForm';
import { NhomMembersDialog } from '../components/NhomMembersDialog';
import type { Nhom, NhomFormValues } from '../types/nhom-nguoi-dung.types';

// ── Column factory ─────────────────────────────────────────────────────────────
function buildColumns(
  search: string,
  page: number,
  myNhomSet: ReadonlySet<number>,
  coQuyen: (maTacVu: MaTacVu) => boolean,
  handlers: {
    onMembers: (item: Nhom) => void;
    onEdit: (item: Nhom) => void;
    onDelete: (item: Nhom) => void;
  },
): ColumnDef<Nhom>[] {
  const rowActions: RowActionDef<Nhom>[] = [
    { key: 'members', maTacVu: MA_TAC_VU.XEM, icon: Users,  variant: 'view',   title: 'Thành viên', onClick: handlers.onMembers },
    { key: 'edit',    maTacVu: MA_TAC_VU.SUA, icon: Pencil, variant: 'edit',   title: 'Sửa',        onClick: handlers.onEdit,   hidden: (item) => myNhomSet.has(item.Id) },
    { key: 'delete',  maTacVu: MA_TAC_VU.XOA, icon: Trash2, variant: 'delete', title: 'Xóa',        onClick: handlers.onDelete, hidden: (item) => myNhomSet.has(item.Id) },
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
      accessorKey: 'Ma',
      header: 'Mã nhóm',
      meta: { className: 'w-36' },
      cell: ({ row }) => (
        <HighlightText
          text={row.original.Ma}
          highlight={search}
          className="font-mono text-[12.5px] font-medium text-[#1a3c6e]"
        />
      ),
    },
    {
      accessorKey: 'Ten',
      header: 'Tên nhóm',
      cell: ({ row }) => (
        <HighlightText text={row.original.Ten} highlight={search} className="text-[13px] text-gray-800" />
      ),
    },
    {
      accessorKey: 'GhiChu',
      header: 'Ghi chú',
      cell: ({ row }) =>
        row.original.GhiChu
          ? <span className="text-[12.5px] text-gray-500">{row.original.GhiChu}</span>
          : <span className="text-gray-300">—</span>,
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

// ── Page ───────────────────────────────────────────────────────────────────────
export function NhomNguoiDungListPage() {
  const { coQuyen } = usePermission(CHUC_NANG_IDS.NHOM_NGUOI_DUNG);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Nhom | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Nhom | null>(null);
  const [membersTarget, setMembersTarget] = useState<Nhom | null>(null);

  const { data, isLoading } = useNhomList({
    pageNumber: page,
    pageSize: DEFAULT_PAGE_SIZE,
    searchText: search || undefined,
  });
  const { data: myNhomIds = [] } = useMyNhomIds();
  const saveMutation = useSaveNhom();
  const deleteMutation = useDeleteNhom();

  const items = data?.Items ?? [];
  const total = data?.Total ?? 0;
  // Set tra cứu O(1) — thròng qua useMemo tránh tạo lại mỗi render
  const myNhomSet = useMemo(() => new Set(myNhomIds) as ReadonlySet<number>, [myNhomIds]);

  // Handlers
  const handleSearchChange = useCallback((v: string) => { setSearch(v); setPage(1); }, []);
  const handleOpenAdd     = useCallback(() => { setEditItem(null); setFormOpen(true); }, []);
  const handleFormClose   = useCallback(() => setFormOpen(false), []);
  const handleEdit        = useCallback((item: Nhom) => { setEditItem(item); setFormOpen(true); }, []);
  const handleDelete      = useCallback((item: Nhom) => setDeleteTarget(item), []);
  const handleMembers     = useCallback((item: Nhom) => setMembersTarget(item), []);

  const handleFormSubmit = useCallback(
    (values: NhomFormValues) => {
      saveMutation.mutate(values, { onSuccess: () => setFormOpen(false) });
    },
    [saveMutation],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.Id, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, deleteMutation]);

  const columns = useMemo(
    () => buildColumns(search, page, myNhomSet, coQuyen, { onMembers: handleMembers, onEdit: handleEdit, onDelete: handleDelete }),
    [search, page, myNhomSet, coQuyen, handleMembers, handleEdit, handleDelete],
  );

  return (
    <>
      <ListPageShell
        title="Quản lý nhóm người dùng"
        description="Phân loại và quản lý nhóm tài khoản hệ thống"
        badge={total}
        search={{ value: search, onChange: handleSearchChange, placeholder: 'Tìm mã, tên nhóm...', debounceMs: 300 }}
        actions={coQuyen('THEM') ? <AddButton label="Thêm nhóm" onClick={handleOpenAdd} /> : undefined}
      >
        {!isLoading && items.length === 0 ? (
          <EmptyState
            title="Không có nhóm nào"
            description={search ? `Không tìm thấy kết quả cho "${search}"` : 'Nhấn "Thêm nhóm" để bắt đầu.'}
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

      <NhomForm
        open={formOpen}
        editItem={editItem}
        loading={saveMutation.isPending}
        onSubmit={handleFormSubmit}
        onClose={handleFormClose}
      />

      <NhomMembersDialog
        key={membersTarget?.Id ?? 0}
        open={!!membersTarget}
        nhom={membersTarget}
        onClose={() => setMembersTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa nhóm người dùng"
        description={`Bạn có chắc muốn xóa nhóm "${deleteTarget?.Ten}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
