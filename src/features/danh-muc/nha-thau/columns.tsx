import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NhaThau, TrangThaiNhaThau, LoaiHinhNhaThau } from './types';
import { LOAI_HINH_LABEL, TRANG_THAI_NT_LABEL } from './types';

// ── Badge trạng thái ──────────────────────────────────────────
const STATUS_STYLE: Record<TrangThaiNhaThau, string> = {
  hoat_dong:        'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  tam_ngung:        'bg-amber-50   text-amber-700   ring-1 ring-amber-200',
  ngung_hoat_dong:  'bg-red-50     text-red-600     ring-1 ring-red-200',
};

// ── Column definitions ────────────────────────────────────────
export const nhaThauColumns: ColumnDef<NhaThau>[] = [
  {
    id: 'stt',
    header: 'STT',
    cell: ({ table, row }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return (
        <span className="text-gray-400 tabular-nums">
          {pageIndex * pageSize + row.index + 1}
        </span>
      );
    },
    enableSorting: false,
    meta: { className: 'w-12', align: 'center' },
  },
  {
    accessorKey: 'ma',
    header: 'Mã NT',
    meta: { className: 'w-24' },
  },
  {
    accessorKey: 'ten',
    header: 'Tên nhà thầu',
    cell: ({ getValue }) => (
      <span className="font-medium text-[#1a3c6e]" title={getValue<string>()}>{getValue<string>()}</span>
    ),
    meta: { className: 'max-w-[220px]' },
  },
  {
    accessorKey: 'loaiHinh',
    header: 'Loại hình',
    cell: ({ getValue }) => LOAI_HINH_LABEL[getValue<LoaiHinhNhaThau>()],
    meta: { className: 'w-28' },
  },
  {
    accessorKey: 'maSoThue',
    header: 'MST',
    meta: { className: 'w-28' },
  },
  {
    accessorKey: 'daiDienPhapLuat',
    header: 'Đại diện pháp luật',
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'dienThoai',
    header: 'Điện thoại',
    meta: { className: 'w-28' },
  },
  {
    accessorKey: 'trangThai',
    header: 'Trạng thái',
    cell: ({ getValue }) => {
      const v = getValue<TrangThaiNhaThau>();
      return (
        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold', STATUS_STYLE[v])}>
          {TRANG_THAI_NT_LABEL[v]}
        </span>
      );
    },
    meta: { className: 'w-28' },
  },
  {
    id: 'actions',
    header: '',
    cell: () => (
      <div className="flex items-center justify-center gap-0.5">
        <button
          className="flex size-6 cursor-pointer items-center justify-center rounded-md text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
          title="Xem chi tiết"
        >
          <Eye size={12} />
        </button>
        <button
          className="flex size-6 cursor-pointer items-center justify-center rounded-md text-gray-300 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          title="Chỉnh sửa"
        >
          <Pencil size={12} />
        </button>
        <button
          className="flex size-6 cursor-pointer items-center justify-center rounded-md text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
          title="Xóa"
        >
          <Trash2 size={12} />
        </button>
      </div>
    ),
    enableSorting: false,
    meta: { className: 'w-24', align: 'center' },
  },
];