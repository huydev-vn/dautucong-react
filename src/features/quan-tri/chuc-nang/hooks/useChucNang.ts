import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { STALE_TIME, GC_TIME } from '@/lib/cache-config';
import { chucNangApi } from '../api/chuc-nang.api';
import type { ChucNangFormValues, ChucNangListParams } from '../types/chuc-nang.types';

export function useChucNangList(params?: ChucNangListParams) {
  return useQuery({
    queryKey: queryKeys.chucNang.list(params),
    queryFn: () => chucNangApi.getList(params),
    staleTime: STALE_TIME.LIST,
    gcTime: GC_TIME.LIST,
  });
}

/** Toàn bộ chức năng dùng trong dropdown chọn cha — cache REFERENCE (30 phút) */
export function useChucNangDropdown() {
  return useQuery({
    queryKey: queryKeys.chucNang.dropdown(),
    queryFn: () => chucNangApi.getList({ pageNumber: 1, pageSize: 1000 }),
    staleTime: STALE_TIME.REFERENCE,
    gcTime: GC_TIME.REFERENCE,
  });
}

export function useSaveChucNang() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (model: ChucNangFormValues) => chucNangApi.save(model),
    onSuccess: (_, vars) => {
      toast.success(vars.id > 0 ? 'Cập nhật chức năng thành công' : 'Thêm chức năng thành công');
      // invalidate toàn bộ chucNang cache (list + dropdown)
      void qc.invalidateQueries({ queryKey: queryKeys.chucNang.all() });
    },
  });
}

export function useDeleteChucNang() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => chucNangApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa chức năng thành công');
      void qc.invalidateQueries({ queryKey: queryKeys.chucNang.all() });
    },
  });
}
