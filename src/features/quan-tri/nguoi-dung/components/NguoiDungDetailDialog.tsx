import { X, Mail, Building2, Users, ShieldCheck, Shield, Lock, Unlock, CalendarDays } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

// ── Row helper ─────────────────────────────────────────────────
function DetailRow({ icon: Icon, label, children }: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#1a3c6e]/6">
        <Icon size={14} className="text-[#1a3c6e]/60" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <div className="mt-0.5 text-[13px] text-gray-800">{children}</div>
      </div>
    </div>
  );
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
  if (!item) return null;

  const nhomNames = parseNhomIds(item.NhomNguoiDungId).map(
    (id) => nhomMap.get(id) ?? `#${id}`,
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[15px] font-semibold text-[#1a3c6e]">
              Chi tiết người dùng
            </DialogTitle>
            <button
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </DialogHeader>

        {/* Avatar + tên */}
        <div className="mt-1 flex items-center gap-3 rounded-xl bg-[#1a3c6e]/4 px-4 py-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1a3c6e]/12 text-[15px] font-bold text-[#1a3c6e]">
            {item.TenNguoiDung.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-gray-900">{item.TenNguoiDung}</p>
            <p className="font-mono text-[12px] text-gray-500">@{item.TaiKhoan}</p>
          </div>
          <div className="ml-auto flex flex-col items-end gap-1">
            {item.IsAdmin === 1 ? (
              <TableBadge label="Admin" variant="indigo" icon={ShieldCheck} />
            ) : (
              <TableBadge label="Thường" variant="gray" icon={Shield} />
            )}
            {item.IsDelete === 1 ? (
              <TableBadge label="Đã khóa" variant="red" icon={Lock} />
            ) : (
              <TableBadge label="Hoạt động" variant="green" icon={Unlock} />
            )}
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="mt-1 divide-y divide-gray-50 px-1">
          <DetailRow icon={Mail} label="Email">
            {item.Email ? (
              <a href={`mailto:${item.Email}`} className="text-[#1a3c6e] hover:underline">
                {item.Email}
              </a>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </DetailRow>

          <DetailRow icon={Building2} label="Mã đơn vị">
            <span>{item.IdDonVi || <span className="text-gray-400">—</span>}</span>
          </DetailRow>

          <DetailRow icon={Users} label="Nhóm người dùng">
            {nhomNames.length > 0 ? (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {nhomNames.map((name) => (
                  <TableBadge key={name} label={name} variant="blue" />
                ))}
              </div>
            ) : (
              <span className="text-gray-400">Chưa phân nhóm</span>
            )}
          </DetailRow>

          <DetailRow icon={CalendarDays} label="Ngày tạo">
            {formatDate(item.NgayTao)}
          </DetailRow>

          <DetailRow icon={CalendarDays} label="Cập nhật lần cuối">
            <span>{formatDate(item.NgaySua)}</span>
            {item.NguoiSua && (
              <span className="ml-1.5 text-[11.5px] text-gray-400">bởi {item.NguoiSua}</span>
            )}
          </DetailRow>
        </div>
      </DialogContent>
    </Dialog>
  );
}
