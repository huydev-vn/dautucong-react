import axiosInstance from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { NhaThau, NhaThauListParams } from '../types/nha-thau.types';

const BASE = '/nha-thau';

export const nhaThauApi = {
  getList: async (params?: NhaThauListParams): Promise<PaginatedResponse<NhaThau>> => {
    const { data } = await axiosInstance.get<ApiResponse<PaginatedResponse<NhaThau>>>(BASE, { params });
    return data.data;
  },

  getById: async (id: string): Promise<NhaThau> => {
    const { data } = await axiosInstance.get<ApiResponse<NhaThau>>(`${BASE}/${id}`);
    return data.data;
  },

  create: async (payload: Omit<NhaThau, 'id' | 'ngayTao' | 'ngayCapNhat'>): Promise<NhaThau> => {
    const { data } = await axiosInstance.post<ApiResponse<NhaThau>>(BASE, payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<NhaThau>): Promise<NhaThau> => {
    const { data } = await axiosInstance.put<ApiResponse<NhaThau>>(`${BASE}/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE}/${id}`);
  },
};
