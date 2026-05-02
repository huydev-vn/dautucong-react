import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'Không có dữ liệu',
  description = 'Chưa có bản ghi nào được tìm thấy.',
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
  <div
  className={cn(
    "flex flex-col items-center justify-center gap-5 py-16 text-center select-none",
    className
  )}
>
  {/* Icon */}
  <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-[#1a3c6e]/20 bg-[#1a3c6e]/10 text-[#1a3c6e] shadow-sm">
    {icon ?? <Inbox size={30} strokeWidth={1.8} />}
  </div>

  {/* Text */}
  <div className="flex flex-col items-center gap-2">
    <p className="text-[15px] font-semibold text-slate-700">
      {title}
    </p>

    {description && (
      <p className="max-w-[320px] text-[13px] leading-relaxed text-slate-500">
        {description}
      </p>
    )}
  </div>

  {/* Action */}
  {action && <div className="mt-2">{action}</div>}
</div>  
  );
}
