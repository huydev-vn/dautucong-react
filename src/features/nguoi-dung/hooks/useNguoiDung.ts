import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/utils/constants';
import { nguoiDungApi } from '../api/nguoi-dung.api';
import type { NguoiDungListParams } from '../types/nguoi-dung.types';

export function useNguoiDungList(params?: NguoiDungListParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.NGUOI_DUNG, 'list', params],
    queryFn: () => nguoiDungApi.getList(params),
  });
}

export function useDeleteNguoiDung() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: nguoiDungApi.delete,
    onSuccess: () => {
      toast.success('Xóa người dùng thành công');
      void qc.invalidateQueries({ queryKey: [QUERY_KEYS.NGUOI_DUNG] });
    },
  });
}
