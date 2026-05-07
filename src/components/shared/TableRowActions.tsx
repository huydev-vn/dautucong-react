import type { LucideIcon } from 'lucide-react';
import { RowActionButton } from './RowActionButton';
import type { RowActionVariant } from './RowActionButton';
import type { MaTacVu } from '@/utils/constants';

// ── Định nghĩa một hành động ──────────────────────────────────
/**
 * Mô tả một nút thao tác trong cột "Thao tác" của bảng.
 * Component sẽ tự kiểm tra `coQuyen(maTacVu)` trước khi render.
 */
export interface RowActionDef<T> {
  /** Unique key cho React — dùng tên mô tả, VD: 'view', 'edit', 'delete', 'reset-password' */
  key: string;
  /**
   * Mã tác vụ cần kiểm tra — phải là một trong `MA_TAC_VU`.
   * TypeScript sẽ báo lỗi nếu gõ sai.
   *
   * @example
   * import { MA_TAC_VU } from '@/utils/constants';
   * maTacVu: MA_TAC_VU.XEM
   */
  maTacVu: MaTacVu;
  /** Icon Lucide */
  icon: LucideIcon;
  /** Tooltip hiển thị khi hover */
  title: string;
  /** Màu sắc nút — xem RowActionVariant để biết các tuỳ chọn */
  variant: RowActionVariant;
  /** Hàm xử lý khi click */
  onClick: (item: T) => void;
  /**
   * Ẩn nút dựa trên dữ liệu của dòng (ngoài permission).
   * VD: ẩn nút Xóa với bản ghi đang được sử dụng.
   */
  hidden?: (item: T) => boolean;
}

// ── Props ─────────────────────────────────────────────────────
interface TableRowActionsProps<T> {
  /** Dữ liệu của dòng hiện tại */
  item: T;
  /** Hàm kiểm tra quyền — lấy từ usePermission().coQuyen */
  coQuyen: (maTacVu: MaTacVu) => boolean;
  /** Danh sách các nút cần hiển thị */
  actions: RowActionDef<T>[];
}

// ── Component ─────────────────────────────────────────────────
/**
 * Cột "Thao tác" chuẩn cho mọi bảng — tự xử lý kiểm tra quyền + render nút.
 *
 * Dev khai báo `actions` config một lần, component lo phần còn lại.
 * Không cần viết `RowActions` function riêng cho từng trang.
 *
 * @example
 * ```tsx
 * import { Eye, Pencil, Trash2 } from 'lucide-react';
 * import { MA_TAC_VU } from '@/utils/constants';
 * import { TableRowActions, type RowActionDef } from '@/components/shared/TableRowActions';
 *
 * // Khai báo ngoài component để tránh tạo lại mỗi render
 * const ROW_ACTIONS: RowActionDef<MyModel>[] = [
 *   { key: 'view',   maTacVu: MA_TAC_VU.XEM,  icon: Eye,    variant: 'view',   title: 'Xem chi tiết', onClick: (item) => onView(item) },
 *   { key: 'edit',   maTacVu: MA_TAC_VU.SUA,  icon: Pencil, variant: 'edit',   title: 'Sửa',          onClick: (item) => onEdit(item) },
 *   { key: 'delete', maTacVu: MA_TAC_VU.XOA,  icon: Trash2, variant: 'delete', title: 'Xóa',          onClick: (item) => onDelete(item) },
 * ];
 *
 * // Trong column definition:
 * cell: ({ row }) => <TableRowActions item={row.original} coQuyen={coQuyen} actions={ROW_ACTIONS} />
 * ```
 *
 * @note
 * Khi `onClick` phụ thuộc state/callback từ page (handlers thay đổi theo render),
 * hãy dùng `useMemo` để tạo config, truyền handlers vào qua closure.
 */
export function TableRowActions<T>({
  item,
  coQuyen,
  actions,
}: TableRowActionsProps<T>) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      {actions.map((action) => {
        if (!coQuyen(action.maTacVu)) return null;
        if (action.hidden?.(item)) return null;
        return (
          <RowActionButton
            key={action.key}
            variant={action.variant}
            icon={action.icon}
            title={action.title}
            onClick={() => action.onClick(item)}
          />
        );
      })}
    </div>
  );
}
