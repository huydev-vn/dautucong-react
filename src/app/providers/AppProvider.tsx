import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/features/auth';
import { STORAGE_KEYS } from '@/utils/constants';
import { router } from '../router';

function AuthInitializer() {
  useEffect(() => {
    // ── DEBUG: in lại lỗi auth từ session trước (bị clear do page reload) ──
    const raw = sessionStorage.getItem('__auth_debug__');
    if (raw) {
      try {
        const err = JSON.parse(raw) as { url: string; status: number | null; body: unknown; message: string | null; token_in_storage: string | null; token_looks_like_jwt: boolean; time: string };
        console.group('%c[Auth] Lỗi refresh token (session trước → redirect login)', 'color: red; font-weight: bold');
        console.log('Thời gian:', err.time);
        console.log('Request gốc bị 401:', err.url);
        console.log('Status refresh endpoint:', err.status);
        console.log('Body trả về:', err.body);
        console.log('Message:', err.message);
        console.log('Token trong localStorage lúc lỗi:', err.token_in_storage);
        console.log('Token có đúng định dạng JWT không:', err.token_looks_like_jwt);
        console.groupEnd();
      } catch { /* ignore */ }
      sessionStorage.removeItem('__auth_debug__');
    }

    // Self-heal: nếu Zustand persist còn isAuthenticated: true nhưng access_token đã bị xóa
    // (ví dụ do interceptor xóa token trong phiên trước mà không xóa Zustand state)
    // → logout để đưa về trạng thái nhất quán, tránh truy cập API không có Bearer token.
    const store = useAuthStore.getState();
    if (store.isAuthenticated && !localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) {
      store.logout();
    }

    store.initialize();
  }, []);

  return null;
}

export function AppProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
