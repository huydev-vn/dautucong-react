import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/utils/constants';
import { duAnApi } from '../api/du-an.api';
import type { DuAnListParams } from '../types/du-an.types';

export function useDuAnList(params?: DuAnListParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.DU_AN, 'list', params],
    queryFn: () => duAnApi.getList(params),
  });
}

export function useDuAnDetail(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.DU_AN, 'detail', id],
    queryFn: () => duAnApi.getById(id),
    enabled: !!id,
  });
}

export function useDeleteDuAn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: duAnApi.delete,
    onSuccess: () => {
      toast.success('Xóa dự án thành công');
      void qc.invalidateQueries({ queryKey: [QUERY_KEYS.DU_AN] });
    },
  });
}
