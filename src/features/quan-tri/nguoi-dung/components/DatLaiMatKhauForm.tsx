import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormDialog } from '@/components/shared/FormDialog';
import { TextField } from '@/components/shared/Form/TextField';

// ── Schema ─────────────────────────────────────────────────────
const schema = z
  .object({
    taiKhoan: z.string().min(1, 'Thiếu tài khoản'),
    matKhauMoi: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(100, 'Tối đa 100 ký tự'),
    xacNhan: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((v) => v.matKhauMoi === v.xacNhan, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['xacNhan'],
  });

type FormValues = z.infer<typeof schema>;

// ── Props ──────────────────────────────────────────────────────
interface DatLaiMatKhauFormProps {
  open: boolean;
  taiKhoan: string; // pre-fill từ hàng được chọn
  loading?: boolean;
  onSubmit: (taiKhoan: string, matKhauMoi: string) => void;
  onClose: () => void;
}

// ── Component ──────────────────────────────────────────────────
// key={taiKhoan} ở parent → remount khi đổi target user → form tự reset
export function DatLaiMatKhauForm({
  open,
  taiKhoan,
  loading = false,
  onSubmit,
  onClose,
}: DatLaiMatKhauFormProps) {
  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { taiKhoan, matKhauMoi: '', xacNhan: '' },
  });

  function handleSubmit(values: FormValues) {
    onSubmit(values.taiKhoan, values.matKhauMoi);
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={form.handleSubmit(handleSubmit)}
      loading={loading}
      title="Đặt lại mật khẩu"
      description={`Thiết lập mật khẩu mới cho tài khoản "${taiKhoan}".`}
      size="sm"
      submitLabel="Đặt lại mật khẩu"
    >
      <div className="flex flex-col gap-3">
        <TextField
          control={form.control}
          name="taiKhoan"
          label="Tài khoản"
          readOnly
        />
        <TextField
          control={form.control}
          name="matKhauMoi"
          label="Mật khẩu mới"
          type="password"
          required
          placeholder="Tối thiểu 6 ký tự"
        />
        <TextField
          control={form.control}
          name="xacNhan"
          label="Xác nhận mật khẩu"
          type="password"
          required
          placeholder="Nhập lại mật khẩu mới"
        />
      </div>
    </FormDialog>
  );
}
