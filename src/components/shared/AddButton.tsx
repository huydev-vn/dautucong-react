import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AddButtonProps {
  /** Nhãn hiển thị trên nút. VD: "Thêm người dùng", "Thêm chức năng" */
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Nút "Thêm mới" chuẩn — dùng thống nhất trên mọi trang danh sách.
 *
 * Đặt trong prop `actions` của `<ListPageShell>`.
 *
 * @example
 * ```tsx
 * <ListPageShell
 *   ...
 *   actions={<AddButton label="Thêm người dùng" onClick={handleOpenAdd} />}
 * >
 * ```
 */
export function AddButton({ label, onClick, disabled = false, className }: AddButtonProps) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn('gap-1.5', className)}
    >
      <Plus size={15} />
      {label}
    </Button>
  );
}
