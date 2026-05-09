import { useState, useCallback, useMemo } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { ListPageShell } from '@/components/shared/ListPageShell';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { HighlightText } from '@/components/shared/HighlightText';
import { TableBadge } from '@/components/shared/TableBadge';
import { AddButton } from '@/components/shared/AddButton';
import { TreeTable } from '@/components/shared/TreeTable';
import { TableRowActions, type RowActionDef } from '@/components/shared/TableRowActions';
import { DetailDialog } from '@/components/shared/DetailDialog';
import { MA_TAC_VU } from '@/utils/constants';
import { usePermissionByUrl } from '@/features/auth/hooks/usePermissionByUrl';
import { type UsePermissionResult } from '@/features/auth/hooks/usePermission';
import { useDiaBanAll, useSaveDiaBan, useDeleteDiaBan } from '../hooks/useDiaBan';
import { DiaBanForm } from '../components/DiaBanForm';
import type { DiaBan, DiaBanFormValues } from '../types/dia-ban.type';

function buildColumns(
  search: string,
  coQuyen: UsePermissionResult['coQuyen'],
  handlers: {
    onView:   (item: DiaBan) => void;
    onEdit:   (item: DiaBan) => void;
    onDelete: (item: DiaBan) => void;
  },
): ColumnDef<DiaBan>[] {
  const rowActions: RowActionDef<DiaBan>[] = [
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
      header: 'Tên địa bàn',
      cell: ({ row }) => (
        <HighlightText text={row.original.Ten} highlight={search} className="text-[13px] text-gray-800" />
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

// ── Tree-aware client-side filter ──────────────────────────────────────────────
// Khi node con khớp search → giữ nguyên tất cả node cha để TreeTable dựng cây đúng
function filterTreeItems(items: DiaBan[], search: string): DiaBan[] {
  if (!search.trim()) return items;
  const q = search.trim().toLowerCase();
  const itemMap = new Map(items.map((i) => [i.Id, i]));
  const keepSet = new Set<number>();

  for (const item of items) {
    if (item.Ma.toLowerCase().includes(q) || item.Ten.toLowerCase().includes(q)) {
      keepSet.add(item.Id);
      // Giữ toàn bộ tổ tiên → TreeTable hiển thị đúng vị trí cây
      let cur: DiaBan | undefined = item;
      while (cur?.IdCha != null) {
        const parent = itemMap.get(cur.IdCha);
        if (!parent) break;
        keepSet.add(parent.Id);
        cur = parent;
      }
    }
  }

  return items.filter((i) => keepSet.has(i.Id));
}

export function DiaBanListPage() {
  const { coQuyen } = usePermissionByUrl('/qldm/dmdiaban');

  const [search,        setSearch]        = useState('');
  const [filterHieuLuc, setFilterHieuLuc] = useState<number | undefined>(undefined);
  const [formOpen,      setFormOpen]      = useState(false);
  const [editItem,      setEditItem]      = useState<DiaBan | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<DiaBan | null>(null);
  const [detailItem,    setDetailItem]    = useState<DiaBan | null>(null);

  // Không truyền keyword lên backend — load toàn bộ, filter client-side để giữ cây cha-con
  const { data: allItems = [], isLoading } = useDiaBanAll({ hieuLuc: filterHieuLuc });

  const items = useMemo(() => filterTreeItems(allItems, search), [allItems, search]);

  const saveMutation   = useSaveDiaBan();
  const deleteMutation = useDeleteDiaBan();

  const handleSearchChange = useCallback((v: string) => setSearch(v), []);
  const handleView         = useCallback((item: DiaBan) => setDetailItem(item), []);
  const handleEdit         = useCallback((item: DiaBan) => { setEditItem(item); setFormOpen(true); }, []);
  const handleDelete       = useCallback((item: DiaBan) => setDeleteTarget(item), []);
  const handleOpenAdd      = useCallback(() => { setEditItem(null); setFormOpen(true); }, []);
  const handleFormClose    = useCallback(() => setFormOpen(false), []);

  const handlers = useMemo(
    () => ({ onView: handleView, onEdit: handleEdit, onDelete: handleDelete }),
    [handleView, handleEdit, handleDelete],
  );
  const columns = useMemo(() => buildColumns(search, coQuyen, handlers), [search, coQuyen, handlers]);

  const handleSave = useCallback(
    (values: DiaBanFormValues) => {
      saveMutation.mutate(values, { onSuccess: () => setFormOpen(false) });
    },
    [saveMutation],
  );

  // Fallback TenCha client-side — phòng khi backend chưa deploy Oracle package mới.
  // allItems đã được load, nên tra cha từ map thay vì gọi thêm API.
  const detailItemMap = useMemo(() => new Map(allItems.map((i) => [i.Id, i])), [allItems]);
  const detailTenCha = useMemo(() => {
    if (!detailItem) return null;
    if (detailItem.TenCha) return detailItem.TenCha;
    if (detailItem.IdCha == null) return null; // root node
    return detailItemMap.get(detailItem.IdCha)?.Ten ?? null;
  }, [detailItem, detailItemMap]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.Id, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteMutation, deleteTarget]);

  const filters = (
    <select
      value={filterHieuLuc ?? ''}
      onChange={(e) => setFilterHieuLuc(e.target.value !== '' ? Number(e.target.value) : undefined)}
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
        title="Danh mục địa bàn"
        description="Quản lý địa bàn theo cây cha-con không giới hạn cấp."
        badge={allItems.length}
        search={{
          value:       search,
          onChange:    handleSearchChange,
          placeholder: 'Tìm theo mã, tên địa bàn...',
          debounceMs:  300,
        }}
        filters={filters}
        actions={coQuyen(MA_TAC_VU.THEM) ? <AddButton label="Thêm mới" onClick={handleOpenAdd} /> : undefined}
      >
        <TreeTable<DiaBan>
          columns={columns}
          data={items}
          loading={isLoading}
          rowKey="Id"
          parentKey="IdCha"
          defaultExpanded={search.trim() ? 'all' : 'first-level'}
          pageSize={20}
        />
      </ListPageShell>

      {/* Detail dialog */}
      <DetailDialog
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        title="Chi tiết địa bàn"
        size="sm"
        fields={detailItem ? [
          { label: 'Mã',           value: <span className="font-mono font-semibold text-[#1a3c6e]">{detailItem.Ma}</span> },
          { label: 'Thứ tự',       value: detailItem.Stt },
          { label: 'Tên địa bàn',  value: <span className="font-medium">{detailItem.Ten}</span>,  span: 2 },
          { label: 'Địa bàn cha',  value: detailTenCha ?? '— (node gốc)',                         span: 2 },
          { label: 'Hiệu lực',     value: <TableBadge label={detailItem.HieuLuc === 1 ? 'Đang dùng' : 'Ngừng dùng'} variant={detailItem.HieuLuc === 1 ? 'green' : 'gray'} /> },
          { label: 'Ghi chú',      value: detailItem.GhiChu, span: 2, hidden: !detailItem.GhiChu },
          { label: 'Ngày tạo',     value: <span className="text-gray-500">{detailItem.NgayTao}</span> },
          { label: 'Người tạo',    value: <span className="text-gray-500">{detailItem.NguoiTao}</span> },
        ] : []}
      />

      <DiaBanForm
        open={formOpen}
        editItem={editItem}
        loading={saveMutation.isPending}
        onSubmit={handleSave}
        onClose={handleFormClose}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa địa bàn"
        description={`Bạn có chắc muốn xóa địa bàn "${deleteTarget?.Ten}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

