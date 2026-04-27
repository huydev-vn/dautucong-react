import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/utils/constants';
import { keHoachVonApi } from '../api/ke-hoach-von.api';
import type { KeHoachVonListParams } from '../types/ke-hoach-von.types';

export function useKeHoachVonList(params?: KeHoachVonListParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.KE_HOACH_VON, 'list', params],
    queryFn: () => keHoachVonApi.getList(params),
  });
}

export function useDeleteKeHoachVon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: keHoachVonApi.delete,
    onSuccess: () => {
      toast.success('Xóa kế hoạch vốn thành công');
      void qc.invalidateQueries({ queryKey: [QUERY_KEYS.KE_HOACH_VON] });
    },
  });
}
