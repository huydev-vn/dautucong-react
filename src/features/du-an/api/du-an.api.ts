import axiosInstance from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { DuAn, DuAnListParams } from '../types/du-an.types';

const BASE = '/du-an';

export const duAnApi = {
  getList: async (params?: DuAnListParams): Promise<PaginatedResponse<DuAn>> => {
    const { data } = await axiosInstance.get<ApiResponse<PaginatedResponse<DuAn>>>(BASE, { params });
    return data.data;
  },

  getById: async (id: string): Promise<DuAn> => {
    const { data } = await axiosInstance.get<ApiResponse<DuAn>>(`${BASE}/${id}`);
    return data.data;
  },

  create: async (payload: Omit<DuAn, 'id' | 'ngayTao' | 'ngayCapNhat'>): Promise<DuAn> => {
    const { data } = await axiosInstance.post<ApiResponse<DuAn>>(BASE, payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<DuAn>): Promise<DuAn> => {
    const { data } = await axiosInstance.put<ApiResponse<DuAn>>(`${BASE}/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE}/${id}`);
  },
};
