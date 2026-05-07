import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { STALE_TIME, GC_TIME } from '@/lib/cache-config';
import { tacVuApi } from '../api/tac-vu.api';
import type { TacVuFormValues, TacVuListParams } from '../types/tac-vu.types';

export function useTacVuList(params?: TacVuListParams) {
  return useQuery({
    queryKey: queryKeys.tacVu.list(params),
    queryFn: () => tacVuApi.getList(params),
    staleTime: STALE_TIME.LIST,
    gcTime: GC_TIME.LIST,
  });
}

/** Toàn bộ tác vụ dùng trong bảng phân quyền — cache REFERENCE (30 phút) */
export function useTacVuDropdown() {
  return useQuery({
    queryKey: queryKeys.tacVu.dropdown(),
    queryFn: () => tacVuApi.getList({ pageNumber: 1, pageSize: 1000 }),
    staleTime: STALE_TIME.REFERENCE,
    gcTime: GC_TIME.REFERENCE,
  });
}

export function useSaveTacVu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (model: TacVuFormValues) => tacVuApi.save(model),
    onSuccess: (_, vars) => {
      toast.success(vars.id > 0 ? 'Cập nhật tác vụ thành công' : 'Thêm tác vụ thành công');
      void qc.invalidateQueries({ queryKey: queryKeys.tacVu.all() });
    },
  });
}

export function useDeleteTacVu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tacVuApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa tác vụ thành công');
      void qc.invalidateQueries({ queryKey: queryKeys.tacVu.all() });
    },
  });
}
