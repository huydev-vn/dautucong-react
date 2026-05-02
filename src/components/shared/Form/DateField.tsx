import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { FormField } from './FormField';

interface DateFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  disabled?: boolean;
  /**
   * Giá trị tối thiểu theo định dạng yyyy-MM-dd.
   * VD: min="2020-01-01"
   */
  min?: string;
  /**
   * Giá trị tối đa theo định dạng yyyy-MM-dd.
   * VD: max="2030-12-31"
   */
  max?: string;
  hint?: string;
  className?: string;
}

/**
 * Input chọn ngày tháng năm.
 * - Lưu trong form: string yyyy-MM-dd (chuẩn HTML) hoặc null
 * - Hiển thị trên browser tiếng Việt: dd/MM/yyyy (browser tự xử lý theo locale)
 * - Kết hợp date-fns để parse/format nếu cần xử lý thêm ở tầng API
 */
export function DateField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  disabled,
  min,
  max,
  hint,
  className,
}: DateFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          required={required}
          error={fieldState.error?.message}
          hint={hint}
          className={className}
        >
          <Input
            type="date"
            disabled={disabled}
            min={min}
            max={max}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value || null)}
            onBlur={field.onBlur}
            aria-invalid={!!fieldState.error}
            // Style icon lịch của browser
            className={cn(
              '[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-40 [&::-webkit-calendar-picker-indicator]:hover:opacity-70',
            )}
          />
        </FormField>
      )}
    />
  );
}
