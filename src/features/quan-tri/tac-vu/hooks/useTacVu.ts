import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/utils/constants';
import { tacVuApi } from '../api/tac-vu.api';
import type { TacVuFormValues, TacVuListParams } from '../types/tac-vu.types';

export function useTacVuList(params?: TacVuListParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.TAC_VU, 'list', params],
    queryFn: () => tacVuApi.getList(params),
  });
}

export function useSaveTacVu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (model: TacVuFormValues) => tacVuApi.save(model),
    onSuccess: (_, vars) => {
      toast.success(vars.id > 0 ? 'Cập nhật tác vụ thành công' : 'Thêm tác vụ thành công');
      void qc.invalidateQueries({ queryKey: [QUERY_KEYS.TAC_VU] });
    },
    onError: () => {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    },
  });
}

export function useDeleteTacVu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tacVuApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa tác vụ thành công');
      void qc.invalidateQueries({ queryKey: [QUERY_KEYS.TAC_VU] });
    },
    onError: () => {
      toast.error('Xóa thất bại, vui lòng thử lại');
    },
  });
}
