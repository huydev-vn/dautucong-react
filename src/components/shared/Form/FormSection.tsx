import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Nhóm các field liên quan với tiêu đề phân cách.
 * Dùng khi form có nhiều section (VD: "Thông tin cơ bản", "Thông tin tài chính").
 *
 * @example
 * ```tsx
 * <FormSection title="Thông tin dự án">
 *   <div className="grid grid-cols-2 gap-x-4 gap-y-3">
 *     <TextField ... />
 *   </div>
 * </FormSection>
 * ```
 */
export function FormSection({
  title,
  description,
  className,
  children,
}: FormSectionProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Divider với tiêu đề */}
      <div className="flex items-center gap-3">
        <span className="shrink-0 select-none text-[10.5px] font-semibold uppercase tracking-widest text-[#1a3c6e]/50">
          {title}
        </span>
        <div className="h-px flex-1 bg-[#1a3c6e]/8" />
      </div>

      {description && (
        <p className="text-[12px] text-gray-400">{description}</p>
      )}

      {children}
    </div>
  );
}
