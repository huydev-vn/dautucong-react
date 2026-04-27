import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/utils/constants';
import { nhaThauApi } from '../api/nha-thau.api';
import type { NhaThauListParams } from '../types/nha-thau.types';

export function useNhaThauList(params?: NhaThauListParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.NHA_THAU, 'list', params],
    queryFn: () => nhaThauApi.getList(params),
  });
}

export function useNhaThauDetail(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.NHA_THAU, 'detail', id],
    queryFn: () => nhaThauApi.getById(id),
    enabled: !!id,
  });
}

export function useDeleteNhaThau() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: nhaThauApi.delete,
    onSuccess: () => {
      toast.success('Xóa nhà thầu thành công');
      void qc.invalidateQueries({ queryKey: [QUERY_KEYS.NHA_THAU] });
    },
  });
}
