import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormDialog } from '@/components/shared/FormDialog';
import { TextField } from '@/components/shared/Form/TextField';
import { SelectField } from '@/components/shared/Form/SelectField';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import type { NhomItem } from '../api/nhom.api';
import type { NguoiDung, NguoiDungFormValues } from '../types/nguoi-dung.types';
import { useDonViAll } from '../hooks/useNguoiDung';

// ── Validation schema ──────────────────────────────────────────
const baseSchema = z.object({
  id: z.number(),
  idDonVi: z.coerce.number().int().min(1, 'Vui lòng chọn đơn vị'),
  taiKhoan: z
    .string()
    .min(3, 'Tài khoản tối thiểu 3 ký tự')
    .max(100, 'Tối đa 100 ký tự')
    .regex(/^[a-zA-Z0-9._@-]+$/, 'Chỉ được dùng chữ cái, số và . _ @ -'),
  tenNguoiDung: z.string().min(1, 'Tên không được để trống').max(200, 'Tối đa 200 ký tự'),
  nhomId: z.coerce.number().optional(),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  isDelete: z.number(),
  matKhau: z.string().optional(),
});

// Tạo mới: mật khẩu bắt buộc
const schemaCreate = baseSchema.extend({
  matKhau: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(100, 'Tối đa 100 ký tự'),
});

// Cập nhật: KHÔNG có trường mật khẩu — dùng nút "Đặt lại mật khẩu" riêng
const schemaUpdate = baseSchema;

// ── Helpers ────────────────────────────────────────────────────
function parseNhomId(raw: string | null): number | undefined {
  if (!raw) return undefined;
  try {
    const arr = JSON.parse(raw) as number[];
    return Array.isArray(arr) && arr.length > 0 ? arr[0] : undefined;
  } catch { return undefined; }
}

const EMPTY_DEFAULTS: NguoiDungFormValues = {
  id: 0, idDonVi: 0, taiKhoan: '', tenNguoiDung: '',
  nhomId: undefined, matKhau: '', email: '', isDelete: 0,
};

function toDefaults(item: NguoiDung | null): NguoiDungFormValues {
  if (!item) return EMPTY_DEFAULTS;
  return {
    id: item.Id,
    idDonVi: item.IdDonVi,
    taiKhoan: item.TaiKhoan,
    tenNguoiDung: item.TenNguoiDung,
    nhomId: parseNhomId(item.NhomNguoiDungId),
    matKhau: '',
    email: item.Email ?? '',
    isDelete: item.IsDelete ?? 0,
  };
}

// ── Props ──────────────────────────────────────────────────────
interface NguoiDungFormProps {
  open: boolean;
  editItem: NguoiDung | null;
  /** Nhóm người dùng — đã fetch ở trang cha vì cần cho cả hiển thị bảng */
  nhomOptions: NhomItem[];
  loading?: boolean;
  onSubmit: (values: NguoiDungFormValues) => void;
  onClose: () => void;
}

// ── Component ──────────────────────────────────────────────────
export function NguoiDungForm({
  open,
  editItem,
  nhomOptions,
  loading = false,
  onSubmit,
  onClose,
}: NguoiDungFormProps) {
  const isEdit = editItem !== null;

  // Đơn vị chỉ cần khi form mở — lazy fetch, không gọi khi mới vào trang
  const { data: donViList = [] } = useDonViAll(open);

  const form = useForm<NguoiDungFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(isEdit ? schemaUpdate : schemaCreate) as any,
    defaultValues: toDefaults(editItem),
  });

  const isLocked = form.watch('isDelete') === 1;

  const { guardedClose, DiscardDialog } = useUnsavedChanges(form.formState.isDirty, onClose);

  const donViOpts = donViList.map((d) => ({ value: d.Id, label: d.Ten }));
  const nhomOpts = nhomOptions.map((n) => ({ value: n.Id, label: n.Ten }));

  return (
    <>
      <FormDialog
        open={open}
        onClose={guardedClose}
        onSubmit={form.handleSubmit(onSubmit)}
        loading={loading}
        title={isEdit ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}
        size="lg"
        submitLabel={isEdit ? 'Cập nhật' : 'Thêm mới'}
      >
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {/* Tài khoản */}
        <TextField
          control={form.control}
          name="taiKhoan"
          label="Tài khoản"
          required
          placeholder="VD: nguyen.van.a"
          disabled={isEdit}
          className="col-span-2"
        />

        {/* Họ và tên */}
        <TextField
          control={form.control}
          name="tenNguoiDung"
          label="Họ và tên"
          required
          placeholder="VD: Nguyễn Văn A"
          className="col-span-2"
        />

        {/* Đơn vị */}
        <SelectField
          control={form.control}
          name="idDonVi"
          label="Đơn vị"
          required
          options={donViOpts}
          placeholder="— Chọn đơn vị —"
          className="col-span-2"
        />

        {/* Email + Nhóm */}
        <TextField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          placeholder="VD: a@example.com"
        />

        <SelectField
          control={form.control}
          name="nhomId"
          label="Nhóm người dùng"
          options={nhomOpts}
          placeholder="— Chưa phân nhóm —"
        />

        {/* Mật khẩu — chỉ hiện khi tạo mới. Khi sửa dùng nút "Đặt lại mật khẩu" */}
        {!isEdit && (
          <TextField
            control={form.control}
            name="matKhau"
            label="Mật khẩu"
            type="password"
            required
            placeholder="Tối thiểu 6 ký tự"
            className="col-span-2"
          />
        )}

        {/* Trạng thái tài khoản — chỉ hiện khi sửa */}
        {isEdit && (
          <div className="col-span-2 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-[13px] font-medium text-gray-700">Trạng thái tài khoản</p>
              <p className="text-[11.5px] text-gray-500">
                {isLocked
                  ? 'Tài khoản đang bị khóa — người dùng không thể đăng nhập.'
                  : 'Tài khoản đang hoạt động bình thường.'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={!isLocked}
              onClick={() => form.setValue('isDelete', isLocked ? 0 : 1)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                isLocked ? 'bg-red-400' : 'bg-green-500'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isLocked ? 'translate-x-1' : 'translate-x-6'
                }`}
              />
            </button>
          </div>
        )}
      </div>
      </FormDialog>
      {DiscardDialog}
    </>
  );
}
