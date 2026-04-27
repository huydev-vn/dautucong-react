import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

// ── Re-export SkeletonTheme để dùng ở cấp page nếu cần override màu ──
export { SkeletonTheme };

// ─────────────────────────────────────────────────────────────────────
// SkeletonTable
// Dùng cho: bảng danh sách dự án, hợp đồng, kế hoạch vốn, v.v.
// ─────────────────────────────────────────────────────────────────────
interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

export function SkeletonTable({ rows = 8, cols = 5 }: SkeletonTableProps) {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="w-full overflow-hidden rounded-lg border border-border bg-card">
        {/* Header row */}
        <div
          className="grid gap-4 border-b border-border bg-muted/40 px-4 py-3"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} height={14} borderRadius={4} />
          ))}
        </div>

        {/* Data rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="grid gap-4 border-b border-border/50 px-4 py-3.5 last:border-0"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {Array.from({ length: cols }).map((_, colIdx) => (
              <Skeleton
                key={colIdx}
                height={14}
                width={colIdx === 0 ? '80%' : colIdx === cols - 1 ? '60%' : '90%'}
                borderRadius={4}
              />
            ))}
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SkeletonCard
// Dùng cho: dashboard stats card, detail card
// ─────────────────────────────────────────────────────────────────────
interface SkeletonCardProps {
  count?: number;
}

export function SkeletonCard({ count = 4 }: SkeletonCardProps) {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton width={100} height={14} borderRadius={4} />
              <Skeleton width={36} height={36} borderRadius={8} />
            </div>
            <Skeleton width={120} height={28} borderRadius={4} />
            <Skeleton width={80} height={12} borderRadius={4} />
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SkeletonDetailPage
// Dùng cho: trang chi tiết dự án, hợp đồng
// ─────────────────────────────────────────────────────────────────────
export function SkeletonDetailPage() {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton width={300} height={24} borderRadius={6} />
            <Skeleton width={200} height={14} borderRadius={4} />
          </div>
          <Skeleton width={120} height={36} borderRadius={8} />
        </div>

        {/* Content cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 rounded-lg border border-border bg-card p-6">
            <Skeleton width={160} height={18} borderRadius={4} />
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton width={80} height={12} borderRadius={3} />
                  <Skeleton height={16} borderRadius={4} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-card p-6">
            <Skeleton width={120} height={18} borderRadius={4} />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton width={70} height={12} borderRadius={3} />
                <Skeleton height={16} borderRadius={4} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}
