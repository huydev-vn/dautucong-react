import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { STALE_TIME, GC_TIME } from '@/lib/cache-config';
import { nhomNguoiDungApi } from '../api/nhom-nguoi-dung.api';
import type { NhomFormValues, NhomListParams, MemberListParams } from '../types/nhom-nguoi-dung.types';

export function useNhomList(params?: NhomListParams) {
  return useQuery({
    queryKey: queryKeys.nhomNguoiDung.list(params),
    queryFn: () => nhomNguoiDungApi.getList(params),
    staleTime: STALE_TIME.LIST,
    gcTime: GC_TIME.LIST,
  });
}

export function useSaveNhom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (model: NhomFormValues) => nhomNguoiDungApi.save(model),
    onSuccess: (_, vars) => {
      toast.success(vars.id > 0 ? 'Cập nhật nhóm thành công' : 'Thêm nhóm thành công');
      // Invalidate cả list page lẫn dropdown (dùng ở NguoiDungForm)
      void qc.invalidateQueries({ queryKey: queryKeys.nhomNguoiDung.all() });
      void qc.invalidateQueries({ queryKey: queryKeys.nhom.all() });
    },
  });
}

export function useDeleteNhom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => nhomNguoiDungApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa nhóm thành công');
      void qc.invalidateQueries({ queryKey: queryKeys.nhomNguoiDung.all() });
      void qc.invalidateQueries({ queryKey: queryKeys.nhom.all() });
    },
  });
}

// Dùng trong NhomMembersDialog — danh sách chi tiết thành viên (paged)
export function useNhomMembersDetail(params: MemberListParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.nhomNguoiDung.members(params.idNhom, params as unknown),
    queryFn: () => nhomNguoiDungApi.getMembersDetail(params),
    staleTime: STALE_TIME.DETAIL,
    gcTime: GC_TIME.DETAIL,
    enabled,
  });
}

// Dùng trong NhomAssignDialog — chỉ lấy IDs để pre-check
export function useNhomMemberIds(idNhom: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.nhomNguoiDung.memberIds(idNhom),
    queryFn: () => nhomNguoiDungApi.getMemberIds(idNhom),
    staleTime: STALE_TIME.DETAIL,
    gcTime: GC_TIME.DETAIL,
    enabled: enabled && idNhom > 0,
  });
}

export function useSetNhomMembers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idNhom, userIds }: { idNhom: number; userIds: number[] }) =>
      nhomNguoiDungApi.setMembers(idNhom, userIds),
    onSuccess: (_, vars) => {
      toast.success('Cập nhật thành viên thành công');
      void qc.invalidateQueries({
        queryKey: queryKeys.nhomNguoiDung.membersAll(vars.idNhom),
      });
      void qc.invalidateQueries({
        queryKey: queryKeys.nhomNguoiDung.memberIds(vars.idNhom),
      });
    },
  });
}

// Danh sách ID nhóm của người dùng hiện tại — dùng để ẩn Sửa/Xóa trên list page
export function useMyNhomIds() {
  return useQuery({
    queryKey: queryKeys.nhomNguoiDung.myNhomIds(),
    queryFn: nhomNguoiDungApi.getMyNhomIds,
    staleTime: STALE_TIME.REFERENCE,
    gcTime: GC_TIME.REFERENCE,
  });
}
