import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle2,
  Percent,
  FolderOpen,
  Trophy,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  currency: DollarSign,
  check:    CheckCircle2,
  percent:  Percent,
  project:  FolderOpen,
  done:     Trophy,
  warning:  AlertTriangle,
} as const;

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-500   text-white', text: 'text-blue-700' },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-500  text-white', text: 'text-green-700' },
  indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-500 text-white', text: 'text-indigo-700' },
  amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-500  text-white', text: 'text-amber-700' },
  teal:   { bg: 'bg-teal-50',   icon: 'bg-teal-500   text-white', text: 'text-teal-700' },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-500    text-white', text: 'text-red-700' },
} as const;

interface StatCardProps {
  label: string;
  value: number;
  unit: string;
  change: number;
  icon: keyof typeof ICON_MAP;
  color: keyof typeof COLOR_MAP;
}

export function StatCard({ label, value, unit, change, icon, color }: StatCardProps) {
  const Icon = ICON_MAP[icon];
  const c = COLOR_MAP[color];
  const up = change >= 0;

  const displayValue =
    value >= 1000
      ? value.toLocaleString('vi-VN')
      : value % 1 !== 0
        ? value.toFixed(1)
        : value.toString();

  return (
    <div className={cn('rounded-xl border border-gray-100 p-4 shadow-sm', c.bg)}>
      <div className="flex items-start justify-between gap-2">
        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', c.icon)}>
          <Icon size={18} />
        </div>
        <span
          className={cn(
            'flex items-center gap-0.5 text-[11px] font-semibold rounded-full px-2 py-0.5',
            up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600',
          )}
        >
          {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {up ? '+' : ''}{change}%
        </span>
      </div>

      <div className="mt-3">
        <p className="text-2xl font-extrabold text-gray-900 leading-none">
          {displayValue}
          <span className="ml-1 text-xs font-medium text-gray-500">{unit}</span>
        </p>
        <p className={cn('mt-1 text-[12px] font-medium', c.text)}>{label}</p>
      </div>
    </div>
  );
}
