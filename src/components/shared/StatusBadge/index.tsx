import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
  {
    variants: {
      variant: {
        success:  'bg-green-50  text-green-700  ring-green-600/20',
        warning:  'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
        danger:   'bg-red-50    text-red-700    ring-red-600/20',
        info:     'bg-blue-50   text-blue-700   ring-blue-600/20',
        neutral:  'bg-gray-50   text-gray-700   ring-gray-600/20',
        purple:   'bg-purple-50 text-purple-700 ring-purple-600/20',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  label: string;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({ label, variant, dot = true, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant }), className)}>
      {dot && (
        <span
          className={cn(
            'mr-1.5 size-1.5 rounded-full',
            variant === 'success' && 'bg-green-500',
            variant === 'warning' && 'bg-yellow-500',
            variant === 'danger'  && 'bg-red-500',
            variant === 'info'    && 'bg-blue-500',
            variant === 'neutral' && 'bg-gray-400',
            variant === 'purple'  && 'bg-purple-500',
          )}
        />
      )}
      {label}
    </span>
  );
}
