import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { STALE_TIME, GC_TIME } from '@/lib/cache-config';
import { duAnApi } from '../api/du-an.api';
import type { DuAnListParams } from '../types/du-an.types';

export function useDuAnList(params?: DuAnListParams) {
  return useQuery({
    queryKey: queryKeys.duAn.list(params),
    queryFn: () => duAnApi.getList(params),
    staleTime: STALE_TIME.LIST,
    gcTime: GC_TIME.LIST,
  });
}

export function useDuAnDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.duAn.detail(id),
    queryFn: () => duAnApi.getById(id),
    enabled: !!id,
    staleTime: STALE_TIME.DETAIL,
    gcTime: GC_TIME.DETAIL,
  });
}

export function useDeleteDuAn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: duAnApi.delete,
    onSuccess: () => {
      toast.success('Xóa dự án thành công');
      void qc.invalidateQueries({ queryKey: queryKeys.duAn.all() });
    },
  });
}
