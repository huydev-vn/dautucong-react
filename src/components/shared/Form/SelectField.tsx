import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { FormField } from './FormField';

export interface SelectOption {
  /** Giá trị lưu trong form — string hoặc number */
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: SelectOption[];
  /** Text hiển thị khi chưa chọn, tương ứng giá trị rỗng */
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  className?: string;
}

/**
 * Select native (không dùng Radix) — đáng tin cậy hơn cho form phức tạp,
 * tốt hơn về accessibility và keyboard navigation.
 *
 * Lưu ý: value trong form có thể là number — Zod tự coerce với z.coerce.number().
 */
export function SelectField<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder,
  required,
  disabled,
  hint,
  className,
}: SelectFieldProps<T>) {
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
          <select
            disabled={disabled}
            // Chuyển về string vì native select luôn làm việc với string
            value={field.value != null ? String(field.value) : ''}
            onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
            onBlur={field.onBlur}
            className={cn(
              'h-8 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3',
              'text-[12.5px] text-gray-800 transition-colors',
              'focus:border-[#1a3c6e]/40 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/12',
              'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
              // Placeholder option hiển thị màu nhạt hơn
              !field.value && 'text-gray-400',
              fieldState.error && 'border-red-300 focus:border-red-300 focus:ring-red-100/50',
            )}
          >
            {placeholder && (
              <option value="" disabled={required}>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={String(opt.value)} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
        </FormField>
      )}
    />
  );
}
