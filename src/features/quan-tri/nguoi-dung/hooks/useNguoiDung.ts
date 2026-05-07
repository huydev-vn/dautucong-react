import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/parseApiError';
import { QUERY_KEYS } from '@/utils/constants';
import { nguoiDungApi } from '../api/nguoi-dung.api';
import { nhomApi } from '../api/nhom.api';
import { donViApi } from '../api/donvi.api';
import type { NguoiDungFormValues, NguoiDungListParams, DatLaiMatKhauValues } from '../types/nguoi-dung.types';

export function useNguoiDungList(params?: NguoiDungListParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.NGUOI_DUNG, 'list', params],
    queryFn: () => nguoiDungApi.getList(params),
  });
}

/** Lấy toàn bộ nhóm — cache 5 phút, dùng cho dropdown trong form */
export function useNhomAll() {
  return useQuery({
    queryKey: ['nhom', 'all'],
    queryFn: nhomApi.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

/** Lấy toàn bộ đơn vị — lazy (enabled=false cho đến khi form mở) */
export function useDonViAll(enabled = true) {
  return useQuery({
    queryKey: ['don-vi', 'all'],
    queryFn: donViApi.getAll,
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

export function useSaveNguoiDung() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (model: NguoiDungFormValues) => nguoiDungApi.save(model),
    onSuccess: (_, vars) => {
      toast.success(vars.id > 0 ? 'Cập nhật người dùng thành công' : 'Thêm người dùng thành công');
      void qc.invalidateQueries({ queryKey: [QUERY_KEYS.NGUOI_DUNG] });
    },
    onError: (err: unknown) => {
      toast.error(parseApiError(err));
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
      void qc.invalidateQueries({ queryKey: [QUERY_KEYS.NGUOI_DUNG] });
    },
    onError: (err: unknown) => {
      toast.error(parseApiError(err));
    },
  });
}

export function useDatLaiMatKhau() {
  return useMutation({
    mutationFn: (body: DatLaiMatKhauValues) => nguoiDungApi.datLaiMatKhau(body),
    onSuccess: () => {
      toast.success('Đặt lại mật khẩu thành công');
    },
    onError: (err: unknown) => {
      toast.error(parseApiError(err));
    },
  });
}

