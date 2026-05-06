import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/utils/constants';
import { phanQuyenApi } from '../api/phan-quyen.api';
import type { PhanQuyenLuuRequest } from '../types/phan-quyen.types';

/**
 * Lấy toàn bộ nhóm — dùng key ['nhom','all'] giống nguoi-dung/nhomApi
 * để share cùng React Query cache, tránh collision.
 */
export function useNhomAll() {
  return useQuery({
    queryKey: ['nhom', 'all'],
    queryFn: phanQuyenApi.getNhomList,
    staleTime: 5 * 60 * 1000,
  });
}

/** Lấy toàn bộ tác vụ — mỗi tác vụ là một cột checkbox trong TreeTable. */
export function useTacVuAll() {
  return useQuery({
    queryKey: [QUERY_KEYS.TAC_VU, 'all'],
    queryFn: phanQuyenApi.getTacVuList,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Lấy quyền hiện tại của một nhóm — flat list {IdChucNang, IdTacVu}.
 * Chỉ gọi khi idNhom !== null.
 */
export function useQuyenTheoNhom(idNhom: number | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.PHAN_QUYEN, 'nhom', idNhom],
    queryFn: () => phanQuyenApi.getQuyenTheoNhom(idNhom!),
    enabled: idNhom !== null,
  });
}

/** Lưu toàn bộ phân quyền cho một nhóm — ghi đè hoàn toàn. */
export function useLuuPhanQuyen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: PhanQuyenLuuRequest) => phanQuyenApi.luu(req),
    onSuccess: (_, vars) => {
      toast.success('Lưu phân quyền thành công');
      void qc.invalidateQueries({
        queryKey: [QUERY_KEYS.PHAN_QUYEN, 'nhom', vars.Id_Nhom],
      });
    },
    onError: () => {
      toast.error('Lưu phân quyền thất bại, vui lòng thử lại');
    },
  });
}
