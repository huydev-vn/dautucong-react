import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { STALE_TIME, GC_TIME } from '@/lib/cache-config';
import { nguoiDungApi } from '../api/nguoi-dung.api';
import { nhomApi } from '../api/nhom.api';
import { donViApi } from '../api/donvi.api';
import type { NguoiDungFormValues, NguoiDungListParams, DatLaiMatKhauValues } from '../types/nguoi-dung.types';

export function useNguoiDungList(params?: NguoiDungListParams) {
  return useQuery({
    queryKey: queryKeys.nguoiDung.list(params),
    queryFn: () => nguoiDungApi.getList(params),
    staleTime: STALE_TIME.LIST,
    gcTime: GC_TIME.LIST,
  });
}

/** Nhóm dùng cho dropdown — chia sẻ cache với usePhanQuyen.useNhomDropdown() */
export function useNhomDropdown() {
  return useQuery({
    queryKey: queryKeys.nhom.dropdown(),
    queryFn: nhomApi.getAll,
    staleTime: STALE_TIME.REFERENCE,
    gcTime: GC_TIME.REFERENCE,
  });
}

/** Đơn vị dùng cho dropdown */
export function useDonViDropdown() {
  return useQuery({
    queryKey: queryKeys.donVi.dropdown(),
    queryFn: donViApi.getAll,
    staleTime: STALE_TIME.REFERENCE,
    gcTime: GC_TIME.REFERENCE,
  });
}

export function useSaveNguoiDung() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (model: NguoiDungFormValues) => nguoiDungApi.save(model),
    onSuccess: (_, vars) => {
      toast.success(vars.id > 0 ? 'Cập nhật người dùng thành công' : 'Thêm người dùng thành công');
      void qc.invalidateQueries({ queryKey: queryKeys.nguoiDung.all() });
    },
  });
}

export function useDeleteNguoiDung() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nguoiThaoTac }: { id: number; nguoiThaoTac: string }) =>
      nguoiDungApi.delete(id, nguoiThaoTac),
    onSuccess: () => {
      toast.success('Xóa người dùng thành công');
      void qc.invalidateQueries({ queryKey: queryKeys.nguoiDung.all() });
    },
  });
}

export function useDatLaiMatKhau() {
  return useMutation({
    mutationFn: (body: DatLaiMatKhauValues) => nguoiDungApi.datLaiMatKhau(body),
    onSuccess: () => {
      toast.success('Đặt lại mật khẩu thành công');
    },
  });
}

