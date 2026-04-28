import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/utils/constants';
import { chucNangApi } from '../api/chuc-nang.api';
import type { ChucNangFormValues, ChucNangListParams } from '../types/chuc-nang.types';

export function useChucNangList(params?: ChucNangListParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.CHUC_NANG, 'list', params],
    queryFn: () => chucNangApi.getList(params),
  });
}

// Lấy toàn bộ để dùng trong dropdown IdCha
export function useChucNangAll() {
  return useQuery({
    queryKey: [QUERY_KEYS.CHUC_NANG, 'all'],
    queryFn: () => chucNangApi.getList({ pageNumber: 1, pageSize: 1000 }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveChucNang() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (model: ChucNangFormValues) => chucNangApi.save(model),
    onSuccess: (_, vars) => {
      toast.success(vars.id > 0 ? 'Cập nhật chức năng thành công' : 'Thêm chức năng thành công');
      void qc.invalidateQueries({ queryKey: [QUERY_KEYS.CHUC_NANG] });
    },
    onError: () => {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    },
  });
}

export function useDeleteChucNang() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => chucNangApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa chức năng thành công');
      void qc.invalidateQueries({ queryKey: [QUERY_KEYS.CHUC_NANG] });
    },
    onError: () => {
      toast.error('Xóa thất bại, vui lòng thử lại');
    },
  });
}
