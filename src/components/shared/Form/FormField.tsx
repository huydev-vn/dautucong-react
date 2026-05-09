import type { ReactNode } from 'react';
import { CircleHelp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  /** Giải thích field — hiện icon ? bên cạnh label, hover/focus để xem */
  tooltip?: string;
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
  tooltip,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center gap-1">
        <label className="text-[12px] font-medium leading-none text-gray-600">
          {label}
          {required && (
            <span className="ml-0.5 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  tabIndex={-1}
                  className="flex items-center text-gray-400 transition-colors hover:text-[#1a3c6e]/60 focus:outline-none"
                  aria-label={`Giải thích: ${label}`}
                >
                  <CircleHelp size={12} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px] text-center text-[12px] leading-relaxed">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

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
