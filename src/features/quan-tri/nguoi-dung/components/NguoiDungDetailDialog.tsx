import { ShieldCheck, Shield, Lock, Unlock } from 'lucide-react';
import { DetailDialog } from '@/components/shared/DetailDialog';
import { TableBadge } from '@/components/shared/TableBadge';
import type { NguoiDung } from '../types/nguoi-dung.types';

// ── Helpers ────────────────────────────────────────────────────
function parseNhomIds(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function formatDate(val: string | null | undefined): string {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return val; }
}

// ── Props ──────────────────────────────────────────────────────
interface NguoiDungDetailDialogProps {
  open: boolean;
  item: NguoiDung | null;
  nhomMap: Map<number, string>;
  onClose: () => void;
}

// ── Component ──────────────────────────────────────────────────
export function NguoiDungDetailDialog({
  open,
  item,
  nhomMap,
  onClose,
}: NguoiDungDetailDialogProps) {
  const nhomNames = item ? parseNhomIds(item.NhomNguoiDungId).map((id) => nhomMap.get(id) ?? `#${id}`) : [];

  return (
    <DetailDialog
      open={open}
      onClose={onClose}
      title="Chi tiết người dùng"
      size="md"
      fields={item ? [
        { label: 'Tài khoản', value: <span className="font-mono font-semibold text-[#1a3c6e]">@{item.TaiKhoan}</span> },
        { label: 'Quyền',     value: item.IsAdmin === 1 ? <TableBadge label="Admin" variant="indigo" icon={ShieldCheck} /> : <TableBadge label="Thường" variant="gray" icon={Shield} /> },
        { label: 'Họ và tên', value: item.TenNguoiDung, span: 2 },
        { label: 'Email',     value: item.Email ? <a href={`mailto:${item.Email}`} className="text-[#1a3c6e] hover:underline">{item.Email}</a> : null, span: 2, hidden: !item.Email },
        { label: 'Nhóm người dùng', value: nhomNames.length > 0 ? <div className="flex flex-wrap gap-1">{nhomNames.map((n) => <TableBadge key={n} label={n} variant="blue" />)}</div> : <span className="text-gray-400">Chưa phân nhóm</span>, span: 2 },
        { label: 'Trạng thái',  value: item.IsDelete === 1 ? <TableBadge label="Đã khóa" variant="red" icon={Lock} /> : <TableBadge label="Hoạt động" variant="green" icon={Unlock} /> },
        { label: 'Ngày tạo',    value: <span className="text-gray-500">{formatDate(item.NgayTao)}</span> },
        { label: 'Cập nhật',    value: <span className="text-gray-500">{formatDate(item.NgaySua)}{item.NguoiSua ? <span className="ml-1.5 text-[11.5px] text-gray-400">bởi {item.NguoiSua}</span> : null}</span>, span: 2, hidden: !item.NgaySua },
      ] : []}
    />
  );
}
