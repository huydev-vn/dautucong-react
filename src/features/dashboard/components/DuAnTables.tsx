import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DU_AN_SAN_HAN, TOP_DU_AN } from '../data/dashboard.data';

const RISK_CONFIG = {
  cao:  { label: 'Cao',   cls: 'bg-red-100 text-red-700',    dot: 'bg-red-500' },
  tb:   { label: 'TB',    cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  thap: { label: 'Thấp',  cls: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
} as const;

export function TopDuAnTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="pb-2 pr-3 text-left font-semibold text-gray-500 w-8">#</th>
            <th className="pb-2 pr-3 text-left font-semibold text-gray-500">Tên dự án</th>
            <th className="pb-2 pr-3 text-right font-semibold text-gray-500 whitespace-nowrap">Vốn ĐT<br/>(tỷ)</th>
            <th className="pb-2 pr-3 text-right font-semibold text-gray-500 whitespace-nowrap">Giải ngân<br/>(tỷ)</th>
            <th className="pb-2 text-right font-semibold text-gray-500">Tiến độ</th>
          </tr>
        </thead>
        <tbody>
          {TOP_DU_AN.map((da, i) => (
            <tr key={da.ten} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-2.5 pr-3 text-gray-400 font-mono">{i + 1}</td>
              <td className="py-2.5 pr-3 text-gray-800 font-medium max-w-[220px] truncate">{da.ten}</td>
              <td className="py-2.5 pr-3 text-right text-gray-700 tabular-nums">
                {da.vonDT.toLocaleString('vi-VN')}
              </td>
              <td className="py-2.5 pr-3 text-right text-blue-700 font-semibold tabular-nums">
                {da.giaiNgan.toLocaleString('vi-VN')}
              </td>
              <td className="py-2.5 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        da.tienDo >= 75 ? 'bg-green-500' : da.tienDo >= 40 ? 'bg-blue-500' : 'bg-red-500',
                      )}
                      style={{ width: `${da.tienDo}%` }}
                    />
                  </div>
                  <span className={cn(
                    'font-semibold',
                    da.tienDo >= 75 ? 'text-green-600' : da.tienDo >= 40 ? 'text-blue-600' : 'text-red-500',
                  )}>
                    {da.tienDo}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DuAnSanHanTable() {
  return (
    <div className="space-y-2">
      {DU_AN_SAN_HAN.map((da) => {
        const rc = RISK_CONFIG[da.nguyCo];
        return (
          <div
            key={da.ten}
            className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2.5"
          >
            <div className={cn('flex size-6 shrink-0 items-center justify-center rounded-full', rc.dot)}>
              {da.nguyCo === 'cao'
                ? <AlertTriangle size={11} className="text-white" />
                : da.nguyCo === 'thap'
                  ? <CheckCircle2 size={11} className="text-white" />
                  : <Clock size={11} className="text-white" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-gray-800 truncate">{da.ten}</p>
              <p className="text-[10px] text-gray-400">Hạn: {da.hanHT}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-14 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full',
                    da.tienDo >= 70 ? 'bg-green-500' : da.tienDo >= 40 ? 'bg-amber-400' : 'bg-red-500',
                  )}
                  style={{ width: `${da.tienDo}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-gray-600 w-8 text-right">{da.tienDo}%</span>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', rc.cls)}>
                {rc.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
