import { Suspense } from 'react';
import { AuthPageLoader, AppPageLoader } from './PageLoader';

/**
 * Bọc lazy page trong Suspense với fallback loader phù hợp.
 * Tách riêng khỏi PageLoader.tsx để PageLoader chỉ export components
 * và không vi phạm React Fast Refresh.
 */
export function withSuspense(Component: React.ComponentType, variant: 'auth' | 'app' = 'app') {
  const fallback = variant === 'auth' ? <AuthPageLoader /> : <AppPageLoader />;
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
}
