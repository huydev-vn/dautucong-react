import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/features/auth';
import { tokenStore } from '@/lib/token-store';
import { router } from '../router';

function AuthInitializer() {
  useEffect(() => {
    // Self-heal: nếu Zustand persist còn isAuthenticated: true nhưng token đã hết hạn/bị xóa
    // (ví dụ: user đóng tab rồi mở lại — sessionStorage bị xóa, token không còn)
    // → logout để đưa về trạng thái nhất quán.
    const store = useAuthStore.getState();
    if (store.isAuthenticated && !tokenStore.get()) {
      store.logout();
    }

    store.initialize();
  }, []);

  return null;
}

export function AppProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthInitializer />
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </TooltipProvider>
    </QueryClientProvider>
  );
}
