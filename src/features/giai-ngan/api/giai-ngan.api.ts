import { nghiepVuAxios } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { GiaiNgan, GiaiNganListParams } from '../types/giai-ngan.types';

const BASE = '/giai-ngan';

export const giaiNganApi = {
  getList: async (params?: GiaiNganListParams): Promise<PaginatedResponse<GiaiNgan>> => {
    const { data } = await nghiepVuAxios.get<ApiResponse<PaginatedResponse<GiaiNgan>>>(BASE, { params });
    return data.data;
  },

  getById: async (id: string): Promise<GiaiNgan> => {
    const { data } = await nghiepVuAxios.get<ApiResponse<GiaiNgan>>(`${BASE}/${id}`);
    return data.data;
  },

  create: async (payload: Omit<GiaiNgan, 'id' | 'ngayTao' | 'ngayCapNhat'>): Promise<GiaiNgan> => {
    const { data } = await nghiepVuAxios.post<ApiResponse<GiaiNgan>>(BASE, payload);
    return data.data;
  },

  pheDuyet: async (id: string): Promise<GiaiNgan> => {
    const { data } = await nghiepVuAxios.patch<ApiResponse<GiaiNgan>>(`${BASE}/${id}/phe-duyet`);
    return data.data;
  },

  tuChoi: async (id: string, lyDo: string): Promise<GiaiNgan> => {
    const { data } = await nghiepVuAxios.patch<ApiResponse<GiaiNgan>>(`${BASE}/${id}/tu-choi`, { lyDo });
    return data.data;
  },
};
