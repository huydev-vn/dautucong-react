import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { STALE_TIME, GC_TIME } from '@/lib/cache-config';
import { hopDongApi } from '../api/hop-dong.api';
import type { HopDongListParams } from '../types/hop-dong.types';

export function useHopDongList(params?: HopDongListParams) {
  return useQuery({
    queryKey: queryKeys.hopDong.list(params),
    queryFn: () => hopDongApi.getList(params),
    staleTime: STALE_TIME.LIST,
    gcTime: GC_TIME.LIST,
  });
}

export function useHopDongDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.hopDong.detail(id),
    queryFn: () => hopDongApi.getById(id),
    enabled: !!id,
    staleTime: STALE_TIME.DETAIL,
    gcTime: GC_TIME.DETAIL,
  });
}

export function useDeleteHopDong() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hopDongApi.delete,
    onSuccess: () => {
      toast.success('Xóa hợp đồng thành công');
      void qc.invalidateQueries({ queryKey: queryKeys.hopDong.all() });
    },
  });
}
