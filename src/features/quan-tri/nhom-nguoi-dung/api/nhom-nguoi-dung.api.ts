import axiosInstance from '@/lib/axios';
import type { ApiWrapped, PagedResult } from '@/types';
import type {
  Nhom,
  NhomFormValues,
  NhomListParams,
  NguoiDungTrongNhomRow,
  MemberListParams,
} from '../types/nhom-nguoi-dung.types';

const BASE = '/Nhom';

export const nhomNguoiDungApi = {
  // GET /api/Nhom/LietKe
  getList: async (params?: NhomListParams): Promise<PagedResult<Nhom>> => {
    const { data } = await axiosInstance.get<ApiWrapped<PagedResult<Nhom>>>(
      `${BASE}/LietKe`,
      { params },
    );
    return data.data;
  },

  // POST /api/Nhom/Nhap — id = 0 → tạo mới; id > 0 → cập nhật
  save: async (model: NhomFormValues): Promise<number> => {
    const { data } = await axiosInstance.post<ApiWrapped<number>>(`${BASE}/Nhap`, {
      Id:     model.id,
      Ma:     model.ma,
      Ten:    model.ten,
      GhiChu: model.ghiChu,
    });
    return data.data;
  },

  // DELETE /api/Nhom/Xoa?id={id}
  delete: async (id: number): Promise<number> => {
    const { data } = await axiosInstance.delete<ApiWrapped<number>>(`${BASE}/Xoa`, {
      params: { id },
    });
    return data.data;
  },

  // GET /api/Nhom/NguoiDungTrongNhom?idNhom={idNhom}
  // Trả về danh sách ID — dùng để pre-check khi mở form phân công
  getMemberIds: async (idNhom: number): Promise<{ Ids: number[]; Total: number }> => {
    const { data } = await axiosInstance.get<ApiWrapped<{ Ids: number[]; Total: number }>>(
      `${BASE}/NguoiDungTrongNhom`,
      { params: { idNhom } },
    );
    return data.data;
  },

  // GET /api/Nhom/NguoiDungChiTiet — dùng cho bảng thành viên trong dialog
  getMembersDetail: async (params: MemberListParams): Promise<PagedResult<NguoiDungTrongNhomRow>> => {
    const { data } = await axiosInstance.get<ApiWrapped<PagedResult<NguoiDungTrongNhomRow>>>(
      `${BASE}/NguoiDungChiTiet`,
      {
        params: {
          idNhom:     params.idNhom,
          searchText: params.searchText,
          pageNumber: params.pageNumber,
          pageSize:   params.pageSize,
        },
      },
    );
    return data.data;
  },

  // POST /api/Nhom/ThemNguoiDungVaoNhom — sync toàn bộ danh sách (thêm + xóa chênh lệch)
  setMembers: async (idNhom: number, userIds: number[]): Promise<number> => {
    const { data } = await axiosInstance.post<ApiWrapped<number>>(
      `${BASE}/ThemNguoiDungVaoNhom`,
      { IdNhom: idNhom, UserIds: userIds },
    );
    return data.data;
  },

  // GET /api/Nhom/NhomCuaToi — IDs nhóm của người dùng hiện tại (dùng để ẩn Sửa/Xóa)
  getMyNhomIds: async (): Promise<number[]> => {
    const { data } = await axiosInstance.get<ApiWrapped<number[]>>(`${BASE}/NhomCuaToi`);
    return data.data;
  },
};
