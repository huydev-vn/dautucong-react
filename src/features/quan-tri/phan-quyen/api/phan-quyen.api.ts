import axiosInstance from '@/lib/axios';
import type { ApiWrapped, PagedResult } from '@/types';
import type {
  Nhom,
  TacVuPagedResult,
  ChucNangTacVu,
  PhanQuyenLuuRequest,
} from '../types/phan-quyen.types';

// LibNetCore bọc TẤT CẢ response trong { status, data: T, message } → phải unwrap .data

export const phanQuyenApi = {
  /**
   * GET /api/Nhom/LietKe — trả về Nhom[] (extract Items).
   * Cùng kiểu trả về với nguoi-dung/nhomApi.getAll để share React Query cache ['nhom','all'].
   */
  getNhomList: async (): Promise<Nhom[]> => {
    const { data } = await axiosInstance.get<ApiWrapped<PagedResult<Nhom>>>('/Nhom/LietKe', {
      params: { pageNumber: 1, pageSize: 1000 },
    });
    return data.data?.Items ?? [];
  },

  /**
   * GET /api/TacVu/LietKe — danh sách tác vụ (Xem/Thêm/Sửa/Xóa...).
   * Mỗi TacVu sẽ tương ứng một cột checkbox trong TreeTable phân quyền.
   */
  getTacVuList: async (): Promise<TacVuPagedResult> => {
    const { data } = await axiosInstance.get<ApiWrapped<TacVuPagedResult>>('/TacVu/LietKe', {
      params: { pageNumber: 1, pageSize: 1000 },
    });
    return data.data;
  },

  /**
   * GET /api/PhanQuyen/QuyenTheoNhom?idNhom={id}
   * Trả về flat list các cặp (IdChucNang, IdTacVu) đang được phân quyền cho nhóm đó.
   */
  getQuyenTheoNhom: async (idNhom: number): Promise<ChucNangTacVu[]> => {
    const { data } = await axiosInstance.get<ApiWrapped<ChucNangTacVu[]>>(
      '/PhanQuyen/QuyenTheoNhom',
      { params: { idNhom } },
    );
    return data.data ?? [];
  },

  /**
   * POST /api/PhanQuyen/Luu
   * Lưu toàn bộ phân quyền cho một nhóm (ghi đè hoàn toàn).
   * Body: { Id_Nhom, DanhSachQuyen: [{IdChucNang, IdTacVu}] }
   */
  luu: async (request: PhanQuyenLuuRequest): Promise<number> => {
    const { data } = await axiosInstance.post<ApiWrapped<number>>('/PhanQuyen/Luu', request);
    return data.data;
  },
};
