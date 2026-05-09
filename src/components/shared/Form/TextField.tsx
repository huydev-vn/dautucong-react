import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { FormField } from './FormField';

interface TextFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  /** Chỉ đọc — trình bày như input nhưng không chỉnh sửa được */
  readOnly?: boolean;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  hint?: string;
  /** Giải thích field — hiện icon ? bên cạnh label */
  tooltip?: string;
  className?: string;
}

export function TextField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  placeholder,
  disabled,
  readOnly,
  type = 'text',
  hint,
  tooltip,
  className,
}: TextFieldProps<T>) {
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
          <Input
            {...field}
            value={field.value ?? ''}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={!!fieldState.error}
            className={cn(readOnly && 'cursor-default bg-muted/30 focus-visible:ring-0')}
          />
        </FormField>
      )}
    />
  );
}
