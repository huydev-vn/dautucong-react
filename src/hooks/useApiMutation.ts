import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/parseApiError';

type ApiMutationOptions<TData, TVariables, TContext = unknown> = Omit<
  UseMutationOptions<TData, unknown, TVariables, TContext>,
  'mutationFn'
> & {
  /** Hiện toast thành công sau khi mutate thành công */
  successMessage?: string;
  /** Ghi đè thông báo lỗi (bỏ qua parseApiError) */
  errorMessage?: string;
};

/**
 * Wrapper quanh `useMutation` tích hợp sẵn:
 * - Toast lỗi tự động qua `parseApiError` (phân biệt network / 401 / 500 …)
 * - Toast thành công khi truyền `successMessage`
 * - Vẫn cho phép truyền `onSuccess` / `onError` để xử lý logic thêm
 */
export function useApiMutation<TData = unknown, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: ApiMutationOptions<TData, TVariables, TContext>,
) {
  const { successMessage, errorMessage, onSuccess, onError, ...rest } = options ?? {};

  return useMutation<TData, unknown, TVariables, TContext>({
    mutationFn,
    onSuccess: (data, variables, context) => {
      if (successMessage) toast.success(successMessage);
      onSuccess?.(data, variables, context);
    },
    onError: (err, variables, context) => {
      toast.error(errorMessage ?? parseApiError(err));
      onError?.(err, variables, context);
    },
    ...rest,
  });
}
