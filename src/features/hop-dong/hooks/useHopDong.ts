import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/utils/constants';
import { hopDongApi } from '../api/hop-dong.api';
import type { HopDongListParams } from '../types/hop-dong.types';

export function useHopDongList(params?: HopDongListParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.HOP_DONG, 'list', params],
    queryFn: () => hopDongApi.getList(params),
  });
}

export function useHopDongDetail(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.HOP_DONG, 'detail', id],
    queryFn: () => hopDongApi.getById(id),
    enabled: !!id,
  });
}

export function useDeleteHopDong() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hopDongApi.delete,
    onSuccess: () => {
      toast.success('Xóa hợp đồng thành công');
      void qc.invalidateQueries({ queryKey: [QUERY_KEYS.HOP_DONG] });
    },
  });
}
