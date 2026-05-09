import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormDialog } from '@/components/shared/FormDialog';
import { TextField } from '@/components/shared/Form/TextField';
import { NumberField } from '@/components/shared/Form/NumberField';
import { SelectField } from '@/components/shared/Form/SelectField';
import { TextareaField } from '@/components/shared/Form/TextareaField';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import type { DonVi, DonViFormValues } from '../types/don-vi.type';

// ── Validation schema ──────────────────────────────────────────────────────────
const schema = z.object({
  id:        z.number(),
  ma:        z.string().min(1, 'Mã không được để trống').max(20, 'Tối đa 20 ký tự'),
  ten:       z.string().min(1, 'Tên không được để trống').max(200, 'Tối đa 200 ký tự'),
  dienThoai: z.string().max(20, 'Tối đa 20 ký tự').optional().or(z.literal('')),
  email:     z.string().email({ message: 'Email không hợp lệ' }).optional().or(z.literal('')),
  diaChi:    z.string().max(500, 'Tối đa 500 ký tự').optional().or(z.literal('')),
  hieuLuc:   z.coerce.number(),
  stt:       z.coerce.number().int().optional(),
  ghiChu:    z.string().max(500, 'Tối đa 500 ký tự').optional().or(z.literal('')),
});

const HIEU_LUC_OPTIONS = [
  { value: 1, label: 'Đang dùng' },
  { value: 0, label: 'Ngừng dùng' },
];

const EMPTY_DEFAULTS: DonViFormValues = {
  id: 0, ma: '', ten: '', dienThoai: '', email: '', diaChi: '', hieuLuc: 1, stt: undefined, ghiChu: '',
};

function toDefaults(item: DonVi | null): DonViFormValues {
  if (!item) return EMPTY_DEFAULTS;
  return {
    id:        item.Id,
    ma:        item.Ma,
    ten:       item.Ten,
    dienThoai: item.DienThoai ?? '',
    email:     item.Email ?? '',
    diaChi:    item.DiaChi ?? '',
    hieuLuc:   item.HieuLuc,
    stt:       item.Stt ?? undefined,
    ghiChu:    item.GhiChu ?? '',
  };
}

interface DonViFormProps {
  open:      boolean;
  editItem:  DonVi | null;
  loading?:  boolean;
  onSubmit:  (values: DonViFormValues) => void;
  onClose:   () => void;
}

export function DonViForm({ open, editItem, loading = false, onSubmit, onClose }: DonViFormProps) {
  const form = useForm<DonViFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: toDefaults(editItem),
  });

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
        title={editItem ? 'Cập nhật đơn vị' : 'Thêm đơn vị mới'}
        submitLabel={editItem ? 'Cập nhật' : 'Thêm mới'}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <TextField
            control={form.control}
            name="ma"
            label="Mã đơn vị"
            required
            placeholder="VD: DV01, UBND..."
            tooltip="Mã ngắn định danh đơn vị, duy nhất trong hệ thống."
          />
          <NumberField
            control={form.control}
            name="stt"
            label="Thứ tự"
            placeholder="VD: 1"
            min={1}
            tooltip="Thứ tự hiển thị trong danh sách. Số nhỏ hơn hiển thị trước."
          />

          <TextField
            control={form.control}
            name="ten"
            label="Tên đơn vị"
            required
            placeholder="VD: UBND tỉnh Bắc Ninh"
            className="col-span-2"
            tooltip="Tên đầy đủ của đơn vị, hiển thị trên giao diện và báo cáo."
          />

          <TextField
            control={form.control}
            name="dienThoai"
            label="Điện thoại"
            placeholder="VD: 0222 123 456"
            type="tel"
            tooltip="Số điện thoại liên hệ của đơn vị."
          />
          <TextField
            control={form.control}
            name="email"
            label="Email"
            placeholder="VD: contact@donvi.gov.vn"
            type="email"
            tooltip="Địa chỉ email liên hệ của đơn vị."
          />

          <TextareaField
            control={form.control}
            name="diaChi"
            label="Địa chỉ"
            rows={2}
            className="col-span-2"
            placeholder="VD: Số 1 Ngô Gia Tự, TP. Bắc Ninh"
            tooltip="Địa chỉ trụ sở của đơn vị."
          />

          <SelectField
            control={form.control}
            name="hieuLuc"
            label="Hiệu lực"
            required
            options={HIEU_LUC_OPTIONS}
            tooltip="Đơn vị 'Ngừng dùng' vẫn lưu lịch sử nhưng không xuất hiện ở các màn nhập liệu mới."
          />

          <TextareaField
            control={form.control}
            name="ghiChu"
            label="Ghi chú"
            rows={2}
            className="col-span-2"
            tooltip="Thông tin bổ sung về đơn vị, không bắt buộc."
          />
        </div>
      </FormDialog>
      {DiscardDialog}
    </>
  );
}
