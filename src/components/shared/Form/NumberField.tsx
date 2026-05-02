import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField } from './FormField';

interface NumberFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  hint?: string;
  className?: string;
}

export function NumberField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  placeholder,
  disabled,
  min,
  max,
  hint,
  className,
}: NumberFieldProps<T>) {
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
            type="number"
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            // Lưu null thay vì NaN khi xóa trống
            value={field.value ?? ''}
            onChange={(e) =>
              field.onChange(e.target.value === '' ? null : Number(e.target.value))
            }
            onBlur={field.onBlur}
            aria-invalid={!!fieldState.error}
            // Ẩn spinner mặc định của browser
            className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </FormField>
      )}
    />
  );
}
