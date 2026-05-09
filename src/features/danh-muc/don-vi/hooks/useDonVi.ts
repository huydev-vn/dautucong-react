import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { STALE_TIME, GC_TIME } from '@/lib/cache-config';
import { donViApi } from '../api/don-vi.api';
import type { DonViFormValues, DonViListParams } from '../types/don-vi.type';

// ── Danh sách phân trang — server-side ────────────────────────────────────────
export function useDonViList(params?: DonViListParams) {
  return useQuery({
    queryKey: queryKeys.danhMuc.donVi.list(params),
    queryFn:  () => donViApi.getList(params),
    staleTime: STALE_TIME.LIST,
    gcTime:    GC_TIME.LIST,
  });
}

// ── Toàn bộ — dùng cho dropdown (pageSize: 9999) ─────────────────────────────────
function useDonViAll(params?: Pick<DonViListParams, 'hieuLuc'>) {
  return useQuery({
    queryKey: queryKeys.danhMuc.donVi.list({ all: true, ...params }),
    queryFn:  () => donViApi.getList({ pageSize: 9999, ...params }),
    staleTime: STALE_TIME.REFERENCE,
    gcTime:    GC_TIME.REFERENCE,
    select:    (data) => data?.Items ?? [],
  });
}

export { useDonViAll };

// ── Lưu (thêm / sửa) ──────────────────────────────────────────────────────────
export function useSaveDonVi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (model: DonViFormValues) => donViApi.save(model),
    onSuccess: (_, vars) => {
      toast.success(vars.id > 0 ? 'Cập nhật đơn vị thành công' : 'Thêm đơn vị thành công');
      void qc.invalidateQueries({ queryKey: queryKeys.danhMuc.donVi.all() });
    },
  });
}

// ── Xóa mềm ───────────────────────────────────────────────────────────────────
export function useDeleteDonVi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => donViApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa đơn vị thành công');
      void qc.invalidateQueries({ queryKey: queryKeys.danhMuc.donVi.all() });
    },
  });
}
