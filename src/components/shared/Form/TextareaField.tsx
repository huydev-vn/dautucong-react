import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from './FormField';

interface TextareaFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  /** Số dòng hiển thị mặc định, mặc định: 3 */
  rows?: number;
  /** Tắt resize — dùng khi chiều cao cố định */
  noResize?: boolean;
  hint?: string;
  /** Giải thích field — hiện icon ? bên cạnh label */
  tooltip?: string;
  className?: string;
}

export function TextareaField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  placeholder,
  disabled,
  rows = 3,
  noResize = false,
  hint,
  tooltip,
  className,
}: TextareaFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          required={required}
          tooltip={tooltip}
          error={fieldState.error?.message}
          hint={hint}
          className={className}
        >
          <Textarea
            {...field}
            value={field.value ?? ''}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={!!fieldState.error}
            className={cn(noResize ? 'resize-none' : 'resize-y')}
          />
        </FormField>
      )}
    />
  );
}
