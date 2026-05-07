import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormDialog } from '@/components/shared/FormDialog';
import { TextField } from '@/components/shared/Form/TextField';
import { NumberField } from '@/components/shared/Form/NumberField';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import type { TacVu, TacVuFormValues } from '../types/tac-vu.types';

// ── Validation schema ──────────────────────────────────────────
const schema = z.object({
  id: z.number(),
  ma: z.string().min(1, 'Mã tác vụ không được để trống').max(50, 'Tối đa 50 ký tự'),
  ten: z.string().min(1, 'Tên tác vụ không được để trống').max(255, 'Tối đa 255 ký tự'),
  icon: z.string().max(100, 'Tối đa 100 ký tự').optional().or(z.literal('')),
  stt: z.coerce.number().int().optional(),
  viTri: z.string().max(100, 'Tối đa 100 ký tự').optional().or(z.literal('')),
  style: z.string().max(200, 'Tối đa 200 ký tự').optional().or(z.literal('')),
});

// ── Helpers — module level ─────────────────────────────────────
const EMPTY_DEFAULTS: TacVuFormValues = {
  id: 0, ma: '', ten: '', icon: '', stt: undefined, viTri: '', style: '',
};

function toDefaults(item: TacVu | null): TacVuFormValues {
  if (!item) return EMPTY_DEFAULTS;
  return {
    id: item.Id,
    ma: item.Ma,
    ten: item.Ten,
    icon: item.Icon ?? '',
    stt: item.Stt,
    viTri: item.ViTri ?? '',
    style: item.Style ?? '',
  };
}

// ── Props ──────────────────────────────────────────────────────
interface TacVuFormProps {
  open: boolean;
  editItem: TacVu | null;
  loading?: boolean;
  onSubmit: (values: TacVuFormValues) => void;
  onClose: () => void;
}

// ── Component ──────────────────────────────────────────────────
export function TacVuForm({ open, editItem, loading = false, onSubmit, onClose }: TacVuFormProps) {
  const form = useForm<TacVuFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: toDefaults(editItem),
  });

  // Reset form mỗi khi dialog mở hoặc editItem thay đổi — không cần key remount
  useEffect(() => {
    if (open) form.reset(toDefaults(editItem));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editItem]);

  const { guardedClose, DiscardDialog } = useUnsavedChanges(form.formState.isDirty, onClose);

  return (
    <>
      <FormDialog
        open={open}
        onClose={guardedClose}
        onSubmit={form.handleSubmit(onSubmit)}
        loading={loading}
        title={editItem ? 'Cập nhật tác vụ' : 'Thêm tác vụ mới'}
        size="md"
        submitLabel={editItem ? 'Cập nhật' : 'Thêm mới'}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <TextField
            control={form.control}
            name="ma"
            label="Mã tác vụ"
            required
            placeholder="VD: XEM, THEM, SUA, XOA"
          />
          <NumberField
            control={form.control}
            name="stt"
            label="Thứ tự sắp xếp"
            placeholder="VD: 1"
            min={1}
          />
          <TextField
            control={form.control}
            name="ten"
            label="Tên tác vụ"
            required
            placeholder="VD: Xem danh sách"
            className="col-span-2"
          />
          <TextField
            control={form.control}
            name="icon"
            label="Icon (Lucide name)"
            placeholder="VD: Eye, Pencil, Trash2"
          />
          <TextField
            control={form.control}
            name="viTri"
            label="Vị trí hiển thị"
            placeholder="VD: toolbar, row"
          />
          <TextField
            control={form.control}
            name="style"
            label="Style CSS"
            placeholder="VD: text-blue-600"
            className="col-span-2"
          />
        </div>
      </FormDialog>
      {DiscardDialog}
    </>
  );
}
