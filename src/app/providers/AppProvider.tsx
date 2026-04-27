import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/features/auth';
import { router } from '../router';

function AuthInitializer() {
  useEffect(() => {
    // Zustand action là stable reference – chỉ cần chạy một lần sau mount.
    // Tránh đưa action vào deps: nếu persist tạo lại state object khi rehydrate,
    // reference mới sẽ trigger effect vô hạn lần.
    useAuthStore.getState().initialize();
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
