import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormDialog } from '@/components/shared/FormDialog';
import { TextField } from '@/components/shared/Form/TextField';
import { NumberField } from '@/components/shared/Form/NumberField';
import { SelectField } from '@/components/shared/Form/SelectField';
import { TextareaField } from '@/components/shared/Form/TextareaField';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
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

// ── Helpers — module level ─────────────────────────────────────
const EMPTY_DEFAULTS: ChucNangFormValues = {
  id: 0, ma: '', ten: '', url: '', sapXep: undefined, icon: '', idCha: undefined, ghiChu: '',
};

function toDefaults(item: ChucNang | null): ChucNangFormValues {
  if (!item) return EMPTY_DEFAULTS;
  return {
    id: item.Id,
    ma: item.Ma,
    ten: item.Ten,
    url: item.Url ?? '',
    sapXep: item.SapXep,
    icon: item.Icon ?? '',
    idCha: item.IdCha,
    ghiChu: item.GhiChu ?? '',
  };
}

// ── Props ──────────────────────────────────────────────────────
interface ChucNangFormProps {
  open: boolean;
  editItem: ChucNang | null;
  parentOptions: ChucNang[];
  loading?: boolean;
  onSubmit: (values: ChucNangFormValues) => void;
  onClose: () => void;
}

// ── Component ──────────────────────────────────────────────────
// key={editItem?.Id ?? 'new'} đặt ở parent → remount tự động reset form,
// không cần useEffect để sync editItem → defaultValues
export function ChucNangForm({
  open,
  editItem,
  parentOptions,
  loading = false,
  onSubmit,
  onClose,
}: ChucNangFormProps) {
  const form = useForm<ChucNangFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: toDefaults(editItem),
  });

  const parentOpts = parentOptions
    .filter((p) => p.Id !== editItem?.Id)
    .map((p) => ({ value: p.Id, label: p.Ten }));

  const { guardedClose, DiscardDialog } = useUnsavedChanges(form.formState.isDirty, onClose);

  return (
    <>
      <FormDialog
        open={open}
        onClose={guardedClose}
        onSubmit={form.handleSubmit(onSubmit)}
        loading={loading}
        title={editItem ? 'Cập nhật chức năng' : 'Thêm chức năng mới'}
        size="lg"
        submitLabel={editItem ? 'Cập nhật' : 'Thêm mới'}
      >
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <TextField
          control={form.control}
          name="ma"
          label="Mã chức năng"
          required
          placeholder="VD: QUAN_LY_DU_AN"
        />
        <NumberField
          control={form.control}
          name="sapXep"
          label="Thứ tự sắp xếp"
          placeholder="VD: 1"
          min={1}
        />

        <TextField
          control={form.control}
          name="ten"
          label="Tên chức năng"
          required
          placeholder="VD: Quản lý dự án đầu tư"
          className="col-span-2"
        />

        <TextField
          control={form.control}
          name="url"
          label="URL"
          placeholder="VD: /du-an"
        />
        <TextField
          control={form.control}
          name="icon"
          label="Icon"
          placeholder="VD: Building2"
        />

        <SelectField
          control={form.control}
          name="idCha"
          label="Chức năng cha"
          placeholder="— Không có —"
          options={parentOpts}
          className="col-span-2"
        />

        <TextareaField
          control={form.control}
          name="ghiChu"
          label="Ghi chú"
          placeholder="Mô tả thêm..."
          rows={3}
          noResize
          className="col-span-2"
        />
      </div>
      </FormDialog>
      {DiscardDialog}
    </>
  );
}
