import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = { sm: 'size-4', md: 'size-8', lg: 'size-12' };
const BORDER_MAP = { sm: 'border-2', md: 'border-4', lg: 'border-4' };

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-primary border-t-transparent',
        SIZE_MAP[size],
        BORDER_MAP[size],
        className,
      )}
      role="status"
      aria-label="Đang tải..."
    />
  );
}

export function LoadingOverlay({ message = 'Đang tải...' }: { message?: string }) {
  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 text-muted-foreground">
      <LoadingSpinner size="lg" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
