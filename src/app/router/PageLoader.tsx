import { Suspense } from 'react';

/**
 * AuthPageLoader — dùng bên trong AuthLayout (nền gradient xanh)
 * Spinner trắng, hiển thị khi lazy-load trang /login
 */
export function AuthPageLoader() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="size-10 animate-spin rounded-full border-4 border-white/25 border-t-white" />
        <span className="text-xs font-medium tracking-widest text-white/60 uppercase">
          Đang tải...
        </span>
      </div>
    </div>
  );
}

/**
 * AppPageLoader — dùng bên trong AppLayout (nền trắng/xám)
 * Ba chấm nhảy, hiển thị khi lazy-load các trang nội bộ
 */
export function AppPageLoader() {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]" />
          <span className="size-2.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
          <span className="size-2.5 animate-bounce rounded-full bg-blue-400" />
        </div>
        <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Đang tải...
        </span>
      </div>
    </div>
  );
}

export function withSuspense(Component: React.ComponentType, variant: 'auth' | 'app' = 'app') {
  const fallback = variant === 'auth' ? <AuthPageLoader /> : <AppPageLoader />;
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
}
