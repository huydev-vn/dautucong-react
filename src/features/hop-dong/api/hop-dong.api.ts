import { nghiepVuAxios } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { HopDong, HopDongListParams } from '../types/hop-dong.types';

const BASE = '/hop-dong';

export const hopDongApi = {
  getList: async (params?: HopDongListParams): Promise<PaginatedResponse<HopDong>> => {
    const { data } = await nghiepVuAxios.get<ApiResponse<PaginatedResponse<HopDong>>>(BASE, { params });
    return data.data;
  },

  getById: async (id: string): Promise<HopDong> => {
    const { data } = await nghiepVuAxios.get<ApiResponse<HopDong>>(`${BASE}/${id}`);
    return data.data;
  },

  create: async (payload: Omit<HopDong, 'id' | 'ngayTao' | 'ngayCapNhat'>): Promise<HopDong> => {
    const { data } = await nghiepVuAxios.post<ApiResponse<HopDong>>(BASE, payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<HopDong>): Promise<HopDong> => {
    const { data } = await nghiepVuAxios.put<ApiResponse<HopDong>>(`${BASE}/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await nghiepVuAxios.delete(`${BASE}/${id}`);
  },
};
