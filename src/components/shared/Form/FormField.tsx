import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Wrapper dùng chung cho mọi field trong form.
 * Cung cấp: label, dấu * bắt buộc, thông báo lỗi, hint text.
 */
export function FormField({
  label,
  required,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-[12px] font-medium leading-none text-gray-600">
        {label}
        {required && (
          <span className="ml-0.5 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      {/* Hint chỉ hiện khi không có lỗi */}
      {hint && !error && (
        <p className="text-[11.5px] leading-none text-gray-400">{hint}</p>
      )}

      {error && (
        <p className="text-[11.5px] leading-none text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
