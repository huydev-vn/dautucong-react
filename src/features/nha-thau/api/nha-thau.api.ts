import { nghiepVuAxios } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { NhaThau, NhaThauListParams } from '../types/nha-thau.types';

const BASE = '/nha-thau';

export const nhaThauApi = {
  getList: async (params?: NhaThauListParams): Promise<PaginatedResponse<NhaThau>> => {
    const { data } = await nghiepVuAxios.get<ApiResponse<PaginatedResponse<NhaThau>>>(BASE, { params });
    return data.data;
  },

  getById: async (id: string): Promise<NhaThau> => {
    const { data } = await nghiepVuAxios.get<ApiResponse<NhaThau>>(`${BASE}/${id}`);
    return data.data;
  },

  create: async (payload: Omit<NhaThau, 'id' | 'ngayTao' | 'ngayCapNhat'>): Promise<NhaThau> => {
    const { data } = await nghiepVuAxios.post<ApiResponse<NhaThau>>(BASE, payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<NhaThau>): Promise<NhaThau> => {
    const { data } = await nghiepVuAxios.put<ApiResponse<NhaThau>>(`${BASE}/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await nghiepVuAxios.delete(`${BASE}/${id}`);
  },
};
