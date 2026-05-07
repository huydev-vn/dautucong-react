import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Variant ───────────────────────────────────────────────────
/**
 * Tập hợp biến thể màu chuẩn cho nút thao tác trong bảng.
 *
 * | Variant   | Dùng cho                         |
 * |-----------|----------------------------------|
 * | view      | Xem chi tiết                     |
 * | edit      | Sửa / Cập nhật                   |
 * | delete    | Xóa                              |
 * | warning   | Đặt lại MK / Hủy duyệt / Cảnh báo |
 * | default   | Thao tác trung tính              |
 */
export type RowActionVariant = 'view' | 'edit' | 'delete' | 'warning' | 'default';

const VARIANT_CLASSES: Record<RowActionVariant, string> = {
  view:    'bg-sky-50      text-sky-500   hover:bg-sky-100',
  edit:    'bg-[#1a3c6e]/8 text-[#1a3c6e] hover:bg-[#1a3c6e]/15',
  delete:  'bg-red-50      text-red-500   hover:bg-red-100',
  warning: 'bg-amber-50    text-amber-500 hover:bg-amber-100',
  default: 'bg-gray-100    text-gray-600  hover:bg-gray-200',
};

// ── Props ─────────────────────────────────────────────────────
interface RowActionButtonProps {
  /** Icon Lucide hiển thị bên trong nút */
  icon: LucideIcon;
  /** Biến thể màu sắc — đảm bảo đồng nhất toàn app */
  variant?: RowActionVariant;
  /** Tooltip (title) */
  title: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────
/**
 * Nút icon nhỏ chuẩn dùng trong cột "Thao tác" của bảng.
 *
 * Dùng `variant` thay vì tự viết className để màu sắc đồng bộ toàn ứng dụng.
 * Khi cần thay đổi style tổng thể, chỉ sửa một chỗ duy nhất: `VARIANT_CLASSES`.
 *
 * @example
 * ```tsx
 * // Trong RowActions của bất kỳ trang nào:
 * {coQuyen('XEM') && (
 *   <RowActionButton variant="view" icon={Eye} title="Xem chi tiết" onClick={() => onView(item)} />
 * )}
 * {coQuyen('SUA') && (
 *   <RowActionButton variant="edit" icon={Pencil} title="Sửa" onClick={() => onEdit(item)} />
 * )}
 * {coQuyen('XOA') && (
 *   <RowActionButton variant="delete" icon={Trash2} title="Xóa" onClick={() => onDelete(item)} />
 * )}
 * ```
 */
export function RowActionButton({
  icon: Icon,
  variant = 'default',
  title,
  onClick,
  disabled,
  className,
}: RowActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'flex size-7 items-center justify-center rounded-lg transition-colors',
        VARIANT_CLASSES[variant],
        disabled && 'pointer-events-none opacity-40',
        className,
      )}
    >
      <Icon size={13} />
    </button>
  );
}
