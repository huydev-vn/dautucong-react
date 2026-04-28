import axiosInstance from '@/lib/axios';
import type { ApiWrapped } from '@/types';
import type {
  ChucNang,
  ChucNangFormValues,
  ChucNangListParams,
  ChucNangPagedResult,
} from '../types/chuc-nang.types';

// LibNetCore bọc TẤT CẢ response trong { status, data: T, message } → phải unwrap .data

const BASE = '/ChucNang';

export const chucNangApi = {
  /**
   * GET /api/ChucNang/LietKe
   * Backend trả về ApiWrapped<ChucNangPagedResult> với PascalCase fields.
   */
  getList: async (params?: ChucNangListParams): Promise<ChucNangPagedResult> => {
    const { data } = await axiosInstance.get<ApiWrapped<ChucNangPagedResult>>(`${BASE}/LietKe`, { params });
    return data.data;
  },

  /**
   * POST /api/ChucNang/Nhap
   * id = 0 → Tạo mới; id > 0 → Cập nhật.
   */
  save: async (model: ChucNangFormValues): Promise<ChucNang> => {
    const { data } = await axiosInstance.post<ApiWrapped<ChucNang>>(`${BASE}/Nhap`, model);
    return data.data;
  },

  /**
   * POST /api/ChucNang/Xoa?Id={id}
   * Xóa mềm (ISDELETE = 1).
   */
  delete: async (id: number): Promise<number> => {
    const { data } = await axiosInstance.post<ApiWrapped<number>>(`${BASE}/Xoa`, null, {
      params: { Id: id },
    });
    return data.data;
  },
};
