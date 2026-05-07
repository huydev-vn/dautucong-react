import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { STALE_TIME, GC_TIME } from '@/lib/cache-config';
import { nhaThauApi } from '../api/nha-thau.api';
import type { NhaThauListParams } from '../types/nha-thau.types';

export function useNhaThauList(params?: NhaThauListParams) {
  return useQuery({
    queryKey: queryKeys.nhaThau.list(params),
    queryFn: () => nhaThauApi.getList(params),
    staleTime: STALE_TIME.LIST,
    gcTime: GC_TIME.LIST,
  });
}

export function useNhaThauDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.nhaThau.detail(id),
    queryFn: () => nhaThauApi.getById(id),
    enabled: !!id,
    staleTime: STALE_TIME.DETAIL,
    gcTime: GC_TIME.DETAIL,
  });
}

export function useDeleteNhaThau() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: nhaThauApi.delete,
    onSuccess: () => {
      toast.success('Xóa nhà thầu thành công');
      void qc.invalidateQueries({ queryKey: queryKeys.nhaThau.all() });
    },
  });
}
