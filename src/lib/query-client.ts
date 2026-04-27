import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 phút
      gcTime: 1000 * 60 * 10,   // 10 phút
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : 'Đã xảy ra lỗi, vui lòng thử lại.';
        toast.error(message);
      },
    },
  },
});
