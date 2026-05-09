import { useState, useCallback, useMemo } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { ListPageShell } from '@/components/shared/ListPageShell';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { HighlightText } from '@/components/shared/HighlightText';
import { TableBadge } from '@/components/shared/TableBadge';
import { AddButton } from '@/components/shared/AddButton';
import { DataTable } from '@/components/shared/DataTable';
import { TableRowActions, type RowActionDef } from '@/components/shared/TableRowActions';
import { DetailDialog } from '@/components/shared/DetailDialog';
import { MA_TAC_VU } from '@/utils/constants';
import { usePermissionByUrl } from '@/features/auth/hooks/usePermissionByUrl';
import { type UsePermissionResult } from '@/features/auth/hooks/usePermission';
import { useDonViList, useSaveDonVi, useDeleteDonVi } from '../hooks/useDonVi';
import { DonViForm } from '../components/DonViForm';
import type { DonVi, DonViFormValues } from '../types/don-vi.type';

const PAGE_SIZE = 20;

// ── Columns — module-level, không tạo lại mỗi lần render ──────────────────────
function buildColumns(
  search: string,
  coQuyen: UsePermissionResult['coQuyen'],
  handlers: {
    onView:   (item: DonVi) => void;
    onEdit:   (item: DonVi) => void;
    onDelete: (item: DonVi) => void;
  },
): ColumnDef<DonVi>[] {
  const rowActions: RowActionDef<DonVi>[] = [
    { key: 'view',   maTacVu: MA_TAC_VU.XEM, icon: Eye,    variant: 'view',   title: 'Xem chi tiết', onClick: handlers.onView },
    { key: 'edit',   maTacVu: MA_TAC_VU.SUA, icon: Pencil, variant: 'edit',   title: 'Sửa',          onClick: handlers.onEdit },
    { key: 'delete', maTacVu: MA_TAC_VU.XOA, icon: Trash2, variant: 'delete', title: 'Xóa',          onClick: handlers.onDelete },
  ];

  return [
    {
      accessorKey: 'Ma',
      header: 'Mã',
      meta: { className: 'w-28' },
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
      header: 'Tên đơn vị',
      cell: ({ row }) => (
        <HighlightText text={row.original.Ten} highlight={search} className="font-medium text-gray-800" />
      ),
    },
    {
      accessorKey: 'DienThoai',
      header: 'Điện thoại',
      meta: { className: 'w-36' },
      cell: ({ row }) => (
        <span className="text-gray-600">{row.original.DienThoai ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'Email',
      header: 'Email',
      meta: { className: 'w-48' },
      cell: ({ row }) => (
        row.original.Email
          ? <a href={`mailto:${row.original.Email}`} className="text-[#1a3c6e] hover:underline">{row.original.Email}</a>
          : <span className="text-gray-400">—</span>
      ),
    },
    {
      accessorKey: 'HieuLuc',
      header: 'Hiệu lực',
      meta: { className: 'w-28', align: 'center' },
      cell: ({ row }) => (
        <TableBadge
          label={row.original.HieuLuc === 1 ? 'Đang dùng' : 'Ngừng dùng'}
          variant={row.original.HieuLuc === 1 ? 'green' : 'gray'}
        />
      ),
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

// ── Page component ─────────────────────────────────────────────────────────────
export function DonViListPage() {
  const { coQuyen } = usePermissionByUrl('/qldm/dmdonvi');

  const [search,        setSearch]        = useState('');
  const [page,          setPage]          = useState(1);
  const [filterHieuLuc, setFilterHieuLuc] = useState<number | undefined>(undefined);
  const [formOpen,      setFormOpen]      = useState(false);
  const [editItem,      setEditItem]      = useState<DonVi | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<DonVi | null>(null);
  const [detailItem,    setDetailItem]    = useState<DonVi | null>(null);

  const { data, isLoading } = useDonViList({
    pageNumber: page,
    pageSize:   PAGE_SIZE,
    keyword:    search || undefined,
    hieuLuc:    filterHieuLuc,
  });

  const saveMutation   = useSaveDonVi();
  const deleteMutation = useDeleteDonVi();

  // Reset về trang 1 khi search/filter thay đổi
  const handleSearchChange = useCallback((v: string) => { setSearch(v); setPage(1); }, []);
  const handleFilterChange = useCallback((v: number | undefined) => { setFilterHieuLuc(v); setPage(1); }, []);

  const handleView   = useCallback((item: DonVi) => setDetailItem(item), []);
  const handleEdit   = useCallback((item: DonVi) => { setEditItem(item); setFormOpen(true); }, []);
  const handleDelete = useCallback((item: DonVi) => setDeleteTarget(item), []);
  const handleOpenAdd   = useCallback(() => { setEditItem(null); setFormOpen(true); }, []);
  const handleFormClose = useCallback(() => setFormOpen(false), []);

  const handlers = useMemo(
    () => ({ onView: handleView, onEdit: handleEdit, onDelete: handleDelete }),
    [handleView, handleEdit, handleDelete],
  );
  const columns = useMemo(() => buildColumns(search, coQuyen, handlers), [search, coQuyen, handlers]);

  const handleSave = useCallback(
    (values: DonViFormValues) => {
      saveMutation.mutate(values, { onSuccess: () => setFormOpen(false) });
    },
    [saveMutation],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.Id, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteMutation, deleteTarget]);

  const filters = (
    <select
      value={filterHieuLuc ?? ''}
      onChange={(e) => handleFilterChange(e.target.value !== '' ? Number(e.target.value) : undefined)}
      className="h-8 w-auto cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-[12.5px] text-gray-800 transition-colors focus:border-[#1a3c6e]/40 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/12"
    >
      <option value="">Tất cả hiệu lực</option>
      <option value={1}>Đang dùng</option>
      <option value={0}>Ngừng dùng</option>
    </select>
  );

  return (
    <>
      <ListPageShell
        title="Danh mục đơn vị"
        description="Quản lý danh sách đơn vị trong hệ thống."
        badge={data?.Total}
        search={{
          value:       search,
          onChange:    handleSearchChange,
          placeholder: 'Tìm theo mã, tên đơn vị...',
          debounceMs:  300,
        }}
        filters={filters}
        actions={coQuyen(MA_TAC_VU.THEM) ? <AddButton label="Thêm mới" onClick={handleOpenAdd} /> : undefined}
      >
        {/* DataTable — dùng cho dữ liệu phẳng không có cha-con */}
        <DataTable<DonVi>
          columns={columns}
          data={data?.Items ?? []}
          loading={isLoading}
          pageSize={PAGE_SIZE}
          total={data?.Total ?? 0}
          page={page}
          onPageChange={setPage}
        />
      </ListPageShell>

      {/* Detail dialog */}
      <DetailDialog
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        title="Chi tiết đơn vị"
        size="md"
        fields={detailItem ? [
          { label: 'Mã',         value: <span className="font-mono font-semibold text-[#1a3c6e]">{detailItem.Ma}</span> },
          { label: 'Thứ tự',     value: detailItem.Stt },
          { label: 'Tên đơn vị', value: <span className="font-medium">{detailItem.Ten}</span>, span: 2 },
          { label: 'Điện thoại', value: detailItem.DienThoai, hidden: !detailItem.DienThoai },
          { label: 'Email',      value: detailItem.Email
              ? <a href={`mailto:${detailItem.Email}`} className="text-[#1a3c6e] hover:underline">{detailItem.Email}</a>
              : null,
            hidden: !detailItem.Email,
          },
          { label: 'Địa chỉ',   value: detailItem.DiaChi, span: 2, hidden: !detailItem.DiaChi },
          { label: 'Hiệu lực',   value: <TableBadge label={detailItem.HieuLuc === 1 ? 'Đang dùng' : 'Ngừng dùng'} variant={detailItem.HieuLuc === 1 ? 'green' : 'gray'} /> },
          { label: 'Ghi chú',    value: detailItem.GhiChu, span: 2, hidden: !detailItem.GhiChu },
          { label: 'Ngày tạo',   value: <span className="text-gray-500">{detailItem.NgayTao}</span> },
          { label: 'Người tạo',  value: <span className="text-gray-500">{detailItem.NguoiTao}</span> },
        ] : []}
      />

      <DonViForm
        open={formOpen}
        editItem={editItem}
        loading={saveMutation.isPending}
        onSubmit={handleSave}
        onClose={handleFormClose}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa đơn vị"
        description={`Bạn có chắc muốn xóa đơn vị "${deleteTarget?.Ten}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
