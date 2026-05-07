import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { STALE_TIME, GC_TIME } from '@/lib/cache-config';
import { keHoachVonApi } from '../api/ke-hoach-von.api';
import type { KeHoachVonListParams } from '../types/ke-hoach-von.types';

export function useKeHoachVonList(params?: KeHoachVonListParams) {
  return useQuery({
    queryKey: queryKeys.keHoachVon.list(params),
    queryFn: () => keHoachVonApi.getList(params),
    staleTime: STALE_TIME.LIST,
    gcTime: GC_TIME.LIST,
  });
}

export function useDeleteKeHoachVon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: keHoachVonApi.delete,
    onSuccess: () => {
      toast.success('Xóa kế hoạch vốn thành công');
      void qc.invalidateQueries({ queryKey: queryKeys.keHoachVon.all() });
    },
  });
}
