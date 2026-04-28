import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ChucNang, ChucNangFormValues } from '../types/chuc-nang.types';

// ── Validation schema ──────────────────────────────────────────
const schema = z.object({
  id: z.number(),
  ma: z.string().min(1, 'Mã chức năng không được để trống').max(50, 'Tối đa 50 ký tự'),
  ten: z.string().min(1, 'Tên chức năng không được để trống').max(255, 'Tối đa 255 ký tự'),
  url: z.string().max(500, 'Tối đa 500 ký tự').optional().or(z.literal('')),
  sapXep: z.coerce.number().int().optional(),
  icon: z.string().max(100, 'Tối đa 100 ký tự').optional().or(z.literal('')),
  idCha: z.coerce.number().optional(),
  ghiChu: z.string().max(1000, 'Tối đa 1000 ký tự').optional().or(z.literal('')),
});

// ── Props ──────────────────────────────────────────────────────
interface ChucNangFormProps {
  open: boolean;
  editItem: ChucNang | null;
  parentOptions: ChucNang[];
  loading?: boolean;
  onSubmit: (values: ChucNangFormValues) => void;
  onClose: () => void;
}

// ── Field helper — uses shadcn Label ──────────────────────────
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[12px] font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

// shared className for native select (RHF register — cannot use Radix Select)
const selectCls =
  'h-8 w-full cursor-pointer rounded-lg border border-input bg-transparent px-2.5 text-[12.5px] text-gray-800 transition-colors focus:border-[#1a3c6e]/40 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/12 disabled:cursor-not-allowed disabled:opacity-50';

// ── Component ──────────────────────────────────────────────────
export function ChucNangForm({ open, editItem, parentOptions, loading = false, onSubmit, onClose }: ChucNangFormProps) {

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChucNangFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { id: 0, ma: '', ten: '', url: '', sapXep: undefined, icon: '', idCha: undefined, ghiChu: '' },
  });

  // Reset form mỗi khi mở với dữ liệu mới
  useEffect(() => {
    if (!open) return;
    reset(
      editItem
        ? {
            id: editItem.Id,
            ma: editItem.Ma,
            ten: editItem.Ten,
            url: editItem.Url ?? '',
            sapXep: editItem.SapXep,
            icon: editItem.Icon ?? '',
            idCha: editItem.IdCha,
            ghiChu: editItem.GhiChu ?? '',
          }
        : { id: 0, ma: '', ten: '', url: '', sapXep: undefined, icon: '', idCha: undefined, ghiChu: '' },
    );
  }, [open, editItem, reset]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg gap-0 p-0" showCloseButton={false}>
        {/* Header */}
        <DialogHeader className="flex-row items-center justify-between border-b border-gray-100 px-5 py-4">
          <DialogTitle className="text-[15px] font-semibold text-[#1a3c6e]">
            {editItem ? 'Cập nhật chức năng' : 'Thêm chức năng mới'}
          </DialogTitle>
          <DialogClose asChild>
            <button className="flex size-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
              <span aria-hidden className="text-[16px] leading-none">✕</span>
            </button>
          </DialogClose>
        </DialogHeader>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mã chức năng" required error={errors.ma?.message}>
              <Input
                {...register('ma')}
                placeholder="VD: QUAN_LY_DU_AN"
                className={cn('text-[12.5px] focus-visible:border-[#1a3c6e]/40 focus-visible:ring-[#1a3c6e]/12')}
              />
            </Field>
            <Field label="Thứ tự sắp xếp" error={errors.sapXep?.message}>
              <Input
                {...register('sapXep')}
                type="number"
                placeholder="VD: 1"
                className="text-[12.5px] focus-visible:border-[#1a3c6e]/40 focus-visible:ring-[#1a3c6e]/12"
              />
            </Field>
          </div>

          <Field label="Tên chức năng" required error={errors.ten?.message}>
            <Input
              {...register('ten')}
              placeholder="VD: Quản lý dự án đầu tư"
              className="text-[12.5px] focus-visible:border-[#1a3c6e]/40 focus-visible:ring-[#1a3c6e]/12"
            />
          </Field>

          <Field label="URL" error={errors.url?.message}>
            <Input
              {...register('url')}
              placeholder="VD: /du-an"
              className="text-[12.5px] focus-visible:border-[#1a3c6e]/40 focus-visible:ring-[#1a3c6e]/12"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Icon" error={errors.icon?.message}>
              <Input
                {...register('icon')}
                placeholder="VD: Building2"
                className="text-[12.5px] focus-visible:border-[#1a3c6e]/40 focus-visible:ring-[#1a3c6e]/12"
              />
            </Field>

            <Field label="Chức năng cha" error={errors.idCha?.message}>
              <select {...register('idCha')} className={selectCls}>
                <option value="">— Không có —</option>
                {parentOptions
                  .filter((p) => p.Id !== editItem?.Id)
                  .map((p) => (
                    <option key={p.Id} value={p.Id}>
                      {p.Ten}
                    </option>
                  ))}
              </select>
            </Field>
          </div>

          <Field label="Ghi chú" error={errors.ghiChu?.message}>
            <Textarea
              {...register('ghiChu')}
              rows={3}
              placeholder="Mô tả thêm..."
              className="resize-none text-[12.5px] focus-visible:border-[#1a3c6e]/40 focus-visible:ring-[#1a3c6e]/12"
            />
          </Field>

          {/* Footer inside form so submit works */}
          <DialogFooter className="pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#1a3c6e] hover:bg-[#0f2a52]">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Đang lưu...
                </span>
              ) : editItem ? (
                'Cập nhật'
              ) : (
                'Thêm mới'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
