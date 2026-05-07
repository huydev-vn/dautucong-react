import { useState, useCallback, useMemo } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { ListPageShell } from '@/components/shared/ListPageShell';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { HighlightText } from '@/components/shared/HighlightText';
import { TableBadge } from '@/components/shared/TableBadge';
import { AddButton } from '@/components/shared/AddButton';
import { DataTable } from '@/components/shared/DataTable';
import { TableRowActions, type RowActionDef } from '@/components/shared/TableRowActions';
import { DEFAULT_PAGE_SIZE, CHUC_NANG_IDS, MA_TAC_VU } from '@/utils/constants';
import { usePermission } from '@/features/auth/hooks/usePermission';
import { useTacVuList, useSaveTacVu, useDeleteTacVu } from '../hooks/useTacVu';
import { TacVuForm } from '../components/TacVuForm';
import type { TacVu, TacVuFormValues } from '../types/tac-vu.types';

// ── Column definitions factory ─────────────────────────────────
// Đặt ngoài component — chỉ tái tạo khi search/page/handlers thay đổi (useMemo ở page)
function buildColumns(
  search: string,
  page: number,
  coQuyen: ReturnType<typeof usePermission>['coQuyen'],
  handlers: {
    onView: (item: TacVu) => void;
    onEdit: (item: TacVu) => void;
    onDelete: (item: TacVu) => void;
  },
): ColumnDef<TacVu>[] {
  // Khai báo actions config một lần — dùng MA_TAC_VU thay vì string thô
  const rowActions: RowActionDef<TacVu>[] = [
    { key: 'view',   maTacVu: MA_TAC_VU.XEM,  icon: Eye,    variant: 'view',   title: 'Xem chi tiết', onClick: handlers.onView },
    { key: 'edit',   maTacVu: MA_TAC_VU.SUA,  icon: Pencil, variant: 'edit',   title: 'Sửa',          onClick: handlers.onEdit },
    { key: 'delete', maTacVu: MA_TAC_VU.XOA,  icon: Trash2, variant: 'delete', title: 'Xóa',          onClick: handlers.onDelete },
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
      header: 'Mã tác vụ',
      meta: { className: 'w-36' },
      cell: ({ row }) => (
        <HighlightText
          text={row.original.Ma}
          highlight={search}
          className="font-mono text-[12.5px] font-semibold text-[#1a3c6e]"
        />
      ),
    },
    {
      accessorKey: 'Ten',
      header: 'Tên tác vụ',
      cell: ({ row }) => (
        <HighlightText text={row.original.Ten} highlight={search} className="text-[13px] text-gray-800" />
      ),
    },
    {
      accessorKey: 'Icon',
      header: 'Icon',
      meta: { className: 'w-28' },
      cell: ({ row }) =>
        row.original.Icon
          ? <span className="font-mono text-[12px] text-gray-500">{row.original.Icon}</span>
          : <span className="text-gray-300">—</span>,
    },
    {
      accessorKey: 'Stt',
      header: 'Thứ tự',
      meta: { className: 'w-20', align: 'center' },
      cell: ({ row }) => (
        <span className="text-[13px] text-gray-600">{row.original.Stt}</span>
      ),
    },
    {
      accessorKey: 'ViTri',
      header: 'Vị trí',
      meta: { className: 'w-28' },
      cell: ({ row }) =>
        row.original.ViTri
          ? <TableBadge label={row.original.ViTri} variant="blue" />
          : <span className="text-gray-300">—</span>,
    },
    {
      id: 'actions',
      header: 'Thao tác',
      meta: { className: 'w-28', align: 'right' },
      cell: ({ row }) => (
        <TableRowActions item={row.original} coQuyen={coQuyen} actions={rowActions} />
      ),
    },
  ];
}

// ── Page ───────────────────────────────────────────────────────
export function TacVuListPage() {
  const { coQuyen } = usePermission(CHUC_NANG_IDS.TAC_VU);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<TacVu | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TacVu | null>(null);

  const { data, isLoading } = useTacVuList({
    pageNumber: page,
    pageSize: DEFAULT_PAGE_SIZE,
    searchText: search || undefined,
  });

  const saveMutation = useSaveTacVu();
  const deleteMutation = useDeleteTacVu();

  const items = data?.Items ?? [];
  const total = data?.Total ?? 0;

  const handleSearchChange = useCallback((v: string) => { setSearch(v); setPage(1); }, []);
  const handleView   = useCallback((_item: TacVu) => { void _item; /* TODO: dialog chi tiết */ }, []);
  const handleEdit   = useCallback((item: TacVu) => {
    setEditItem(item);
    setFormOpen(true);
  }, []);
  const handleDelete = useCallback((item: TacVu) => setDeleteTarget(item), []);
  const handleOpenAdd = useCallback(() => {
    setEditItem(null);
    setFormOpen(true);
  }, []);
  const handleFormClose = useCallback(() => setFormOpen(false), []);

  const handlers = useMemo(
    () => ({ onView: handleView, onEdit: handleEdit, onDelete: handleDelete }),
    [handleView, handleEdit, handleDelete],
  );

  const columns = useMemo(
    () => buildColumns(search, page, coQuyen, handlers),
    [search, page, coQuyen, handlers],
  );

  const handleSave = useCallback(
    (values: TacVuFormValues) => {
      saveMutation.mutate(values, { onSuccess: () => setFormOpen(false) });
    },
    [saveMutation],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.Id, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteMutation, deleteTarget]);

  return (
    <>
      <ListPageShell
        title="Quản lý tác vụ"
        description="Danh sách các tác vụ (XEM, THÊM, SỬA, XÓA...) được phân quyền trong hệ thống"
        badge={total}
        search={{ value: search, onChange: handleSearchChange, placeholder: 'Tìm theo mã, tên tác vụ...', debounceMs: 300 }}
        actions={coQuyen(MA_TAC_VU.THEM) ? <AddButton label="Thêm mới" onClick={handleOpenAdd} /> : undefined}
      >
        {!isLoading && items.length === 0 ? (
          <EmptyState
            title="Không có tác vụ nào"
            description={search ? `Không tìm thấy kết quả cho "${search}"` : 'Nhấn "Thêm mới" để bắt đầu.'}
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

      <TacVuForm
        open={formOpen}
        editItem={editItem}
        loading={saveMutation.isPending}
        onSubmit={handleSave}
        onClose={handleFormClose}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa tác vụ"
        description={`Bạn có chắc muốn xóa tác vụ "${deleteTarget?.Ten}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
