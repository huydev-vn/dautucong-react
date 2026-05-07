import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { STALE_TIME, GC_TIME } from '@/lib/cache-config';
import { nhomApi } from '../../nguoi-dung/api/nhom.api';
import { phanQuyenApi } from '../api/phan-quyen.api';
import type { PhanQuyenLuuRequest } from '../types/phan-quyen.types';

/**
 * Nhóm dùng cho dropdown — dùng cùng queryKey + queryFn với useNguoiDung.useNhomDropdown()
 * để share một cache entry duy nhất, tránh fetch trùng lặp.
 */
export function useNhomDropdown() {
  return useQuery({
    queryKey: queryKeys.nhom.dropdown(),
    queryFn: nhomApi.getAll,
    staleTime: STALE_TIME.REFERENCE,
    gcTime: GC_TIME.REFERENCE,
  });
}

/** Toàn bộ tác vụ — mỗi tác vụ là một cột checkbox trong bảng phân quyền. */
export function useTacVuDropdown() {
  return useQuery({
    queryKey: queryKeys.tacVu.dropdown(),
    queryFn: phanQuyenApi.getTacVuList,
    staleTime: STALE_TIME.REFERENCE,
    gcTime: GC_TIME.REFERENCE,
  });
}

/**
 * Quyền hiện tại của một nhóm — flat list {IdChucNang, IdTacVu}.
 * Chỉ fetch khi idNhom !== null.
 */
export function useQuyenTheoNhom(idNhom: number | null) {
  return useQuery({
    queryKey: queryKeys.phanQuyen.byNhom(idNhom!),
    queryFn: () => phanQuyenApi.getQuyenTheoNhom(idNhom!),
    enabled: idNhom !== null,
    staleTime: STALE_TIME.LIST,
    gcTime: GC_TIME.LIST,
  });
}

/** Lưu toàn bộ phân quyền cho một nhóm — ghi đè hoàn toàn. */
export function useLuuPhanQuyen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: PhanQuyenLuuRequest) => phanQuyenApi.luu(req),
    onSuccess: (_, vars) => {
      toast.success('Lưu phân quyền thành công');
      // Chỉ invalidate quyền của nhóm vừa lưu, không cần xóa cache nhóm khác
      void qc.invalidateQueries({ queryKey: queryKeys.phanQuyen.byNhom(vars.Id_Nhom) });
    },
  });
}
