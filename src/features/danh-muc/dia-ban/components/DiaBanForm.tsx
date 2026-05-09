import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormDialog } from '@/components/shared/FormDialog';
import { TextField } from '@/components/shared/Form/TextField';
import { NumberField } from '@/components/shared/Form/NumberField';
import { SearchSelectField } from '@/components/shared/Form/SearchSelectField';
import { SelectField } from '@/components/shared/Form/SelectField';
import { TextareaField } from '@/components/shared/Form/TextareaField';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useDiaBanAll } from '../hooks/useDiaBan';
import type { DiaBan, DiaBanFormValues } from '../types/dia-ban.type';

// ── Validation schema ──────────────────────────────────────────────────────────
const schema = z.object({
  id:      z.number(),
  ma:      z.string().min(1, 'Mã không được để trống').max(20, 'Tối đa 20 ký tự'),
  ten:     z.string().min(1, 'Tên không được để trống').max(200, 'Tối đa 200 ký tự'),
  idCha:   z.preprocess(
    (v) => (v === '' || v == null ? null : Number(v)),
    z.number().int().positive().nullable(),
  ),
  hieuLuc: z.coerce.number(),
  stt:     z.coerce.number().int().optional(),
  ghiChu:  z.string().max(500, 'Tối đa 500 ký tự').optional().or(z.literal('')),
});

const HIEU_LUC_OPTIONS = [
  { value: 1, label: 'Đang dùng' },
  { value: 0, label: 'Ngừng dùng' },
];

const EMPTY_DEFAULTS: DiaBanFormValues = {
  id: 0, ma: '', ten: '', idCha: null, hieuLuc: 1, stt: undefined, ghiChu: '',
};

function toDefaults(item: DiaBan | null): DiaBanFormValues {
  if (!item) return EMPTY_DEFAULTS;
  return {
    id:      item.Id,
    ma:      item.Ma,
    ten:     item.Ten,
    idCha:   item.IdCha ?? null,
    hieuLuc: item.HieuLuc,
    stt:     item.Stt ?? undefined,
    ghiChu:  item.GhiChu ?? '',
  };
}

interface DiaBanFormProps {
  open:      boolean;
  editItem:  DiaBan | null;
  loading?:  boolean;
  onSubmit:  (values: DiaBanFormValues) => void;
  onClose:   () => void;
}

export function DiaBanForm({ open, editItem, loading = false, onSubmit, onClose }: DiaBanFormProps) {
  const form = useForm<DiaBanFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: toDefaults(editItem),
  });

  const { data: allItems = [] } = useDiaBanAll();

  // Loại trừ bản thân khỏi danh sách cha — truyền parentValue để SearchSelectField hiển thị dạng cây
  const parentOptions = useMemo(() => {
    const selfId = editItem?.Id;
    return allItems
      .filter((d) => d.Id !== selfId)
      .map((d) => ({ value: d.Id, label: `${d.Ma} — ${d.Ten}`, parentValue: d.IdCha ?? null }));
  }, [allItems, editItem]);

  useEffect(() => {
    if (!open) return;
    form.reset(toDefaults(editItem));
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
        title={editItem ? 'Cập nhật địa bàn' : 'Thêm địa bàn mới'}
        submitLabel={editItem ? 'Cập nhật' : 'Thêm mới'}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <TextField
            control={form.control}
            name="ma"
            label="Mã địa bàn"
            required
            placeholder="VD: 01, HN, ..."
          />
          <NumberField
            control={form.control}
            name="stt"
            label="Thứ tự"
            placeholder="VD: 1"
            min={1}
          />

          <TextField
            control={form.control}
            name="ten"
            label="Tên địa bàn"
            required
            placeholder="VD: Thành phố Hà Nội"
            className="col-span-2"
          />

          <SearchSelectField
            control={form.control}
            name="idCha"
            label="Địa bàn cha"
            options={parentOptions}
            placeholder="— Không có cha (node gốc) —"
            clearable
            className="col-span-2"
          />

          <SelectField
            control={form.control}
            name="hieuLuc"
            label="Hiệu lực"
            required
            options={HIEU_LUC_OPTIONS}
          />

          <TextareaField
            control={form.control}
            name="ghiChu"
            label="Ghi chú"
            rows={2}
            className="col-span-2"
          />
        </div>
      </FormDialog>
      {DiscardDialog}
    </>
  );
}
