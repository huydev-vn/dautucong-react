import type { ReactNode } from 'react';
import { Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

// Hoisted constant — không tạo object mới mỗi render (rule 5.5)
const SIZE_CLS: Record<DialogSize, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  /**
   * Truyền trực tiếp `form.handleSubmit(onSave)` từ react-hook-form.
   * Dialog tự gọi khi nhấn nút Lưu.
   */
  onSubmit: () => void;
  title: string;
  description?: string;
  /** isPending từ mutation — disable nút + hiện spinner */
  loading?: boolean;
  size?: DialogSize;
  submitLabel?: string;
  cancelLabel?: string;
  children: ReactNode;
}

/**
 * Base dialog cho mọi form thêm/sửa trong hệ thống.
 *
 * Thiết kế:
 * - Header cố định với title + nút đóng
 * - Body cuộn được (overflow-y-auto) — an toàn với form dài
 * - Footer cố định với nút Hủy + Lưu
 * - Không thể đóng khi đang loading (tránh mất dữ liệu)
 *
 * Pattern reset form KHÔNG dùng useEffect:
 * ```tsx
 * // Trong parent — thêm key để tự động reset khi item thay đổi
 * <MyForm
 *   key={editItem?.Id ?? 'new'}  // ← remount → useForm chạy lại với defaultValues mới
 *   open={open}
 *   editItem={editItem}
 *   ...
 * />
 * ```
 *
 * @example
 * ```tsx
 * export function NhaThauForm({ open, editItem, onClose, onSubmit: onSave }) {
 *   const form = useForm<Values>({
 *     resolver: zodResolver(schema),
 *     defaultValues: toDefaults(editItem),  // tính từ editItem, không cần useEffect
 *   });
 *
 *   return (
 *     <FormDialog
 *       open={open}
 *       onClose={onClose}
 *       onSubmit={form.handleSubmit(onSave)}
 *       title={editItem ? 'Cập nhật nhà thầu' : 'Thêm nhà thầu mới'}
 *       size="lg"
 *     >
 *       <div className="grid grid-cols-2 gap-x-4 gap-y-3">
 *         <TextField control={form.control} name="ten" label="Tên" required className="col-span-2" />
 *         <TextField control={form.control} name="maSoThue" label="Mã số thuế" required />
 *         <DateField  control={form.control} name="ngayThanhLap" label="Ngày thành lập" />
 *         <CurrencyField control={form.control} name="vonDieuLe" label="Vốn điều lệ" className="col-span-2" />
 *       </div>
 *     </FormDialog>
 *   );
 * }
 * ```
 */
export function FormDialog({
  open,
  onClose,
  onSubmit,
  title,
  description,
  loading = false,
  size = 'md',
  submitLabel = 'Lưu',
  cancelLabel = 'Hủy',
  children,
}: FormDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        // Không cho đóng khi đang gửi dữ liệu
        if (!v && !loading) onClose();
      }}
    >
      <DialogContent
        className={cn(
          'flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0',
          SIZE_CLS[size],
        )}
        showCloseButton={false}
        aria-describedby={description ? undefined : undefined}
      >
        {/* ── Header ────────────────────────────────────────────── */}
        <DialogHeader className="flex shrink-0 flex-row items-start justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <DialogTitle className="text-[14.5px] font-semibold text-[#1a3c6e]">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-[12px] text-gray-400">
                {description}
              </DialogDescription>
            )}
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="ml-4 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:pointer-events-none disabled:opacity-40"
          >
            <X size={15} />
          </button>
        </DialogHeader>

        {/* ── Body cuộn được ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={onClose}
            className="min-w-[64px] text-[12.5px]"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={loading}
            onClick={onSubmit}
            className="min-w-[72px] gap-1.5 bg-[#1a3c6e] text-[12.5px] hover:bg-[#0f2a52]"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
