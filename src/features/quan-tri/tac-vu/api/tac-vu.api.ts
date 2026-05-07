import axiosInstance from '@/lib/axios';
import type { ApiWrapped } from '@/types';
import type { TacVu, TacVuFormValues, TacVuListParams, TacVuPagedResult } from '../types/tac-vu.types';

// LibNetCore bọc TẤT CẢ response trong { status, data: T, message } → phải unwrap .data

const BASE = '/TacVu';

export const tacVuApi = {
  /**
   * GET /api/TacVu/LietKe
   */
  getList: async (params?: TacVuListParams): Promise<TacVuPagedResult> => {
    const { data } = await axiosInstance.get<ApiWrapped<TacVuPagedResult>>(`${BASE}/LietKe`, { params });
    return data.data;
  },

  /**
   * POST /api/TacVu/Nhap
   * id = 0 → Tạo mới; id > 0 → Cập nhật.
   */
  save: async (model: TacVuFormValues): Promise<TacVu> => {
    const { data } = await axiosInstance.post<ApiWrapped<TacVu>>(`${BASE}/Nhap`, model);
    return data.data;
  },

  /**
   * POST /api/TacVu/Xoa?Id={id}
   */
  delete: async (id: number): Promise<number> => {
    const { data } = await axiosInstance.post<ApiWrapped<number>>(`${BASE}/Xoa`, null, {
      params: { Id: id },
    });
    return data.data;
  },
};
