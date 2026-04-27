import { useState, useMemo } from 'react';
import { Plus, Download } from 'lucide-react';
import { ListPageShell } from '@/components/shared/ListPageShell';
import { DataTable } from '@/components/shared/DataTable';
import { nhaThauColumns } from '../nha-thau/columns';
import { NHA_THAU_DATA } from '../nha-thau/data';
import { TRANG_THAI_NT_LABEL } from '../nha-thau/types';
import type { TrangThaiNhaThau } from '../nha-thau/types';

export function NhaThauPage() {
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<TrangThaiNhaThau | ''>('');

  // Lọc client-side — dữ liệu lọc xong mới truyền vào DataTable
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return NHA_THAU_DATA.filter((item) => {
      const matchSearch =
        !q ||
        item.ten.toLowerCase().includes(q) ||
        item.ma.toLowerCase().includes(q) ||
        item.maSoThue.includes(q) ||
        item.daiDienPhapLuat.toLowerCase().includes(q);
      const matchStatus = !statusFilter || item.trangThai === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  return (
    <ListPageShell
      title="Danh mục nhà thầu"
      description="Quản lý danh sách nhà thầu tham gia đấu thầu trên địa bàn tỉnh Bắc Ninh"
      badge={NHA_THAU_DATA.length}
      actions={
        <div className="flex items-center gap-2">
          <button className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={12} />
            Xuất Excel
          </button>
          <button className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-[#1a3c6e] px-2.5 text-[12px] font-semibold text-white hover:bg-[#0f2a52] transition-colors">
            <Plus size={12} />
            Thêm mới
          </button>
        </div>
      }
      search={{
        value: search,
        onChange: setSearch,
        placeholder: 'Tìm tên, mã, MST, đại diện...',
      }}
      filters={
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TrangThaiNhaThau | '')}
          className="h-8 cursor-pointer rounded-lg border border-gray-200 bg-white px-2.5 text-[12px] text-gray-600 focus:border-[#1a3c6e]/40 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/12 transition-all"
        >
          <option value="">Tất cả trạng thái</option>
          {(Object.entries(TRANG_THAI_NT_LABEL) as [TrangThaiNhaThau, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      }
    >
      <DataTable
        columns={nhaThauColumns}
        data={filtered}
        pageSize={10}
      />
    </ListPageShell>
  );
}