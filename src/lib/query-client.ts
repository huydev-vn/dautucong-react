import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/parseApiError';
import { STALE_TIME, GC_TIME } from '@/lib/cache-config';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Fallback defaults — từng hook nên tự khai báo staleTime/gcTime theo tier trong cache-config.ts.
      // Nếu hook không khai báo, LIST tier là mặc định hợp lý cho CRUD thông thường.
      staleTime: STALE_TIME.LIST,
      gcTime: GC_TIME.LIST,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Handler lỗi toàn cục — các hook KHÔNG cần khai báo lại onError.
      // Chỉ khai báo onError trong hook khi muốn xử lý đặc biệt (ví dụ: điều hướng, không toast).
      onError: (error) => {
        toast.error(parseApiError(error));
      },
    },
  },
});
