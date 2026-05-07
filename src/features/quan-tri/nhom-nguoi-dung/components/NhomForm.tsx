import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormDialog } from '@/components/shared/FormDialog';
import { TextField } from '@/components/shared/Form/TextField';
import { TextareaField } from '@/components/shared/Form/TextareaField';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import type { Nhom, NhomFormValues } from '../types/nhom-nguoi-dung.types';

// ── Schema ────────────────────────────────────────────────────
const schema = z.object({
  id:     z.number(),
  ma:     z.string().min(1, 'Mã không được để trống').max(50, 'Tối đa 50 ký tự'),
  ten:    z.string().min(1, 'Tên không được để trống').max(255, 'Tối đa 255 ký tự'),
  ghiChu: z.string().max(1000, 'Tối đa 1000 ký tự'),
});

// ── Helpers ───────────────────────────────────────────────────
const EMPTY_DEFAULTS: NhomFormValues = { id: 0, ma: '', ten: '', ghiChu: '' };

function toDefaults(item: Nhom | null): NhomFormValues {
  if (!item) return EMPTY_DEFAULTS;
  return { id: item.Id, ma: item.Ma, ten: item.Ten, ghiChu: item.GhiChu ?? '' };
}

// ── Props ─────────────────────────────────────────────────────
interface NhomFormProps {
  open: boolean;
  editItem: Nhom | null;
  loading?: boolean;
  onSubmit: (values: NhomFormValues) => void;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────
export function NhomForm({ open, editItem, loading = false, onSubmit, onClose }: NhomFormProps) {
  const isEdit = editItem !== null;

  const form = useForm<NhomFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toDefaults(editItem),
  });

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
        title={isEdit ? 'Cập nhật nhóm' : 'Thêm nhóm mới'}
        submitLabel={isEdit ? 'Cập nhật' : 'Thêm mới'}
      >
        <div className="flex flex-col gap-3">
          <TextField
            control={form.control}
            name="ma"
            label="Mã nhóm"
            required
            placeholder="VD: ADMIN, KETOAN"
            disabled={isEdit}
          />
          <TextField
            control={form.control}
            name="ten"
            label="Tên nhóm"
            required
            placeholder="VD: Nhóm quản trị"
          />
          <TextareaField
            control={form.control}
            name="ghiChu"
            label="Ghi chú"
            placeholder="Mô tả ngắn về nhóm này..."
            rows={3}
          />
        </div>
      </FormDialog>
      {DiscardDialog}
    </>
  );
}
