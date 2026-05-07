import { nghiepVuAxios } from '@/lib/axios';
import type { ApiWrapped, PagedResult } from '@/types';
import type { GiaiNgan, GiaiNganListParams } from '../types/giai-ngan.types';

const BASE = '/giai-ngan';

export const giaiNganApi = {
  getList: async (params?: GiaiNganListParams): Promise<PagedResult<GiaiNgan>> => {
    const { data } = await nghiepVuAxios.get<ApiWrapped<PagedResult<GiaiNgan>>>(BASE, { params });
    return data.data;
  },

  getById: async (id: string): Promise<GiaiNgan> => {
    const { data } = await nghiepVuAxios.get<ApiWrapped<GiaiNgan>>(`${BASE}/${id}`);
    return data.data;
  },

  create: async (payload: Omit<GiaiNgan, 'id' | 'ngayTao' | 'ngayCapNhat'>): Promise<GiaiNgan> => {
    const { data } = await nghiepVuAxios.post<ApiWrapped<GiaiNgan>>(BASE, payload);
    return data.data;
  },

  pheDuyet: async (id: string): Promise<GiaiNgan> => {
    const { data } = await nghiepVuAxios.patch<ApiWrapped<GiaiNgan>>(`${BASE}/${id}/phe-duyet`);
    return data.data;
  },

  tuChoi: async (id: string, lyDo: string): Promise<GiaiNgan> => {
    const { data } = await nghiepVuAxios.patch<ApiWrapped<GiaiNgan>>(`${BASE}/${id}/tu-choi`, { lyDo });
    return data.data;
  },
};
