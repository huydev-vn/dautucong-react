import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { STALE_TIME, GC_TIME } from '@/lib/cache-config';
import { diaBanApi } from '../api/dia-ban.api';
import type { DiaBanFormValues, DiaBanListParams } from '../types/dia-ban.type';

// ── Tải toàn bộ — dùng cho TreeTable và parent select trong form ──────────────
// Không nhận keyword: filter client-side để giữ nguyên cây cha-con khi search
export function useDiaBanAll(params?: Pick<DiaBanListParams, 'hieuLuc'>) {
  return useQuery({
    queryKey: queryKeys.danhMuc.diaBan.list({ all: true, ...params }),
    queryFn:  () => diaBanApi.getList({ pageSize: 9999, ...params }),
    staleTime: STALE_TIME.REFERENCE,
    gcTime:    GC_TIME.REFERENCE,
    select:    (data) => data?.Items ?? [],
  });
}

// ── Lưu (thêm / sửa) ──────────────────────────────────────────────────────────
export function useSaveDiaBan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (model: DiaBanFormValues) => diaBanApi.save(model),
    onSuccess: (_, vars) => {
      toast.success(vars.id > 0 ? 'Cập nhật địa bàn thành công' : 'Thêm địa bàn thành công');
      void qc.invalidateQueries({ queryKey: queryKeys.danhMuc.diaBan.all() });
    },
  });
}

// ── Xóa mềm ───────────────────────────────────────────────────────────────────
export function useDeleteDiaBan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => diaBanApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa địa bàn thành công');
      void qc.invalidateQueries({ queryKey: queryKeys.danhMuc.diaBan.all() });
    },
  });
}
