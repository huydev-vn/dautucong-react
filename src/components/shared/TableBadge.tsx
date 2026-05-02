import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TableBadgeVariant =
  | 'blue'    // #1a3c6e — nhóm, nhãn chung
  | 'green'   // hoạt động, hợp lệ
  | 'red'     // đã khóa, lỗi
  | 'orange'  // cảnh báo
  | 'gray'    // trạng thái trung tính
  | 'indigo'; // admin, vai trò đặc biệt

const VARIANT_CLASSES: Record<TableBadgeVariant, string> = {
  blue:   'bg-[#1a3c6e]/8   text-[#1a3c6e]/80',
  green:  'bg-green-50      text-green-700',
  red:    'bg-red-50        text-red-600',
  orange: 'bg-orange-50     text-orange-600',
  gray:   'bg-gray-100      text-gray-500',
  indigo: 'bg-indigo-50     text-indigo-700',
};

interface TableBadgeProps {
  /** Nhãn hiển thị */
  label: string;
  /** Màu sắc badge */
  variant?: TableBadgeVariant;
  /** Icon trái (Lucide) */
  icon?: LucideIcon;
  className?: string;
}

/**
 * Badge nhỏ dùng trong table cell.
 * Kích thước cố định: font 11px, icon 11px, chiều cao tự động (no wrap).
 */
export function TableBadge({
  label,
  variant = 'gray',
  icon: Icon,
  className,
}: TableBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-[3px] whitespace-nowrap rounded-full px-2 py-0.5',
        'text-[11px] font-medium leading-[1.4]',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {Icon && <Icon size={11} className="shrink-0" />}
      {label}
    </span>
  );
}
