import { useState, type ChangeEvent } from 'react';
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type ControllerFieldState,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { cn } from '@/lib/utils';
import { FormField } from './FormField';

// ── Module-level pure helpers (rule 7.10 — hoist pure functions) ───────────

/** 1_500_000 → "1.500.000" */
function formatVND(value: number | null | undefined): string {
  if (value == null || isNaN(Number(value))) return '';
  return Number(value).toLocaleString('vi-VN');
}

// ── Inner component — module-level để hooks hoạt động đúng ──────────────────
// Tách ra vì Controller render prop không phải React component, không được gọi hooks trực tiếp.
interface CurrencyInputInnerProps {
  field: ControllerRenderProps<FieldValues, string>;
  fieldState: ControllerFieldState;
  label: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  hint?: string;
  className?: string;
}

function CurrencyInputInner({
  field,
  fieldState,
  label,
  required,
  placeholder = '0',
  disabled,
  hint,
  className,
}: CurrencyInputInnerProps) {
  // null = chế độ đọc — display tự động sync từ field.value (bao gồm cả form.reset)
  // string = chế độ gõ — user đang nhập, hiển thị localDisplay
  const [local, setLocal] = useState<string | null>(null);
  const displayValue = local ?? formatVND(field.value as number | null);

  function handleFocus() {
    setLocal(formatVND(field.value as number | null));
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\./g, '').replace(/[^\d]/g, '');
    // Hiển thị format ngay khi gõ
    setLocal(raw ? Number(raw).toLocaleString('vi-VN') : '');
    field.onChange(raw ? Number(raw) : null);
  }  function handleBlur() {
    field.onBlur();
    setLocal(null); // thoát chế độ gõ → display quay về field.value
  }

  return (
    <FormField
      label={label}
      required={required}
      error={fieldState.error?.message}
      hint={hint}
      className={className}
    >
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          disabled={disabled}
          value={displayValue}
          onFocus={handleFocus}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            'h-8 w-full rounded-lg border border-gray-200 bg-white px-3 pr-7',
            'text-right text-[12.5px] text-gray-800 placeholder:text-gray-400',
            'transition-colors focus:border-[#1a3c6e]/40 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/12',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
            fieldState.error && 'border-red-300 focus:border-red-300 focus:ring-red-100/50',
          )}
        />
        {/* Ký hiệu đơn vị tiền Việt Nam */}
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 select-none text-[11px] font-medium text-gray-400">
          đ
        </span>
      </div>
    </FormField>
  );
}

// ── Public field component ───────────────────────────────────────────────────

interface CurrencyFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  /** Placeholder khi không có giá trị, mặc định "0" */
  placeholder?: string;
  disabled?: boolean;
  hint?: string;
  className?: string;
}

/**
 * Input nhập số tiền theo định dạng Việt Nam.
 * - Hiển thị: 1.500.000 đ (dấu chấm phân cách hàng nghìn)
 * - Lưu: number (1500000) trong react-hook-form
 * - Tự động format khi gõ, tự sync khi form reset
 */
export function CurrencyField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  placeholder,
  disabled,
  hint,
  className,
}: CurrencyFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <CurrencyInputInner
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          field={field as any}
          fieldState={fieldState}
          label={label}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          hint={hint}
          className={className}
        />
      )}
    />
  );
}
