import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ── Size map (tái sử dụng từ FormDialog) ──────────────────────
type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLS: Record<DialogSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-2xl',
};

// ── Field descriptor ────────────────────────────────────────────
/**
 * Mỗi field trong dialog chi tiết.
 * - `label` — tiêu đề nhỏ bên trên giá trị
 * - `value` — bất kỳ ReactNode: string, Badge, icon, ...
 * - `span`  — chiều rộng: 1 (mặc định) hoặc 2 (full width)
 * - `hidden` — set `true` để ẩn field (không cần điều kiện ngoài)
 */
export interface DetailField {
  label: string;
  value: ReactNode;
  span?: 1 | 2;
  /** Ẩn field khi `hidden = true` (VD: ghiChu khi không có nội dung) */
  hidden?: boolean;
}

// ── Props ───────────────────────────────────────────────────────
export interface DetailDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Mô tả phụ bên dưới title (tuỳ chọn) */
  description?: string;
  /**
   * Danh sách các field hiển thị.
   * Thứ tự = thứ tự render, span=2 chiếm full width.
   *
   * @example
   * ```tsx
   * fields={[
   *   { label: 'Mã',      value: item.Ma,                 span: 1 },
   *   { label: 'Thứ tự',  value: item.Stt ?? '—',         span: 1 },
   *   { label: 'Tên',     value: item.Ten,                 span: 2 },
   *   { label: 'Địa bàn cha', value: item.TenCha ?? '—',  span: 2 },
   *   { label: 'Ghi chú', value: item.GhiChu,              span: 2, hidden: !item.GhiChu },
   * ]}
   * ```
   */
  fields: DetailField[];
  /** @default 'sm' */
  size?: DialogSize;
}

// ── Label sub-component (module level) ────────────────────────────
function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-gray-400">
      {children}
    </p>
  );
}

// ── DetailDialog ───────────────────────────────────────────────
/**
 * Dialog chi tiết dùng chung cho mọi entity trong hệ thống.
 *
 * **Tại sao dùng base component?**
 * - Giao diện nhất quán: tất cả detail dialog cùng typography, khoảng cách, size
 * - Dev chỉ truyền `fields[]` — không cần viết lại layout
 * - `span=2` cho field full-width (ghi chú, tên dài...)
 * - `hidden` để ẩn field mà không cần điều kiện ở caller
 *
 * @example
 * ```tsx
 * <DetailDialog
 *   open={!!detailItem}
 *   onClose={() => setDetailItem(null)}
 *   title="Chi tiết địa bàn"
 *   size="sm"
 *   fields={[
 *     { label: 'Mã',  value: <code>{item.Ma}</code> },
 *     { label: 'Tên', value: item.Ten, span: 2 },
 *     { label: 'Ghi chú', value: item.GhiChu, span: 2, hidden: !item.GhiChu },
 *   ]}
 * />
 * ```
 */
export function DetailDialog({
  open,
  onClose,
  title,
  description,
  fields,
  size = 'sm',
}: DetailDialogProps) {
  const visibleFields = fields.filter((f) => !f.hidden);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={cn(SIZE_CLS[size])}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <p className="text-[12.5px] text-gray-500">{description}</p>
          )}
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-5 gap-y-3.5 text-[13px]">
          {visibleFields.map((field, i) => (
            <div
              key={i}
              className={cn(
                'min-w-0',
                field.span === 2 ? 'col-span-2' : 'col-span-1',
              )}
            >
              <FieldLabel>{field.label}</FieldLabel>
              <div className="text-gray-800">{field.value ?? '—'}</div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
