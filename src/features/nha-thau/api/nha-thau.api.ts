import { nghiepVuAxios } from '@/lib/axios';
import type { ApiWrapped, PagedResult } from '@/types';
import type { NhaThau, NhaThauListParams } from '../types/nha-thau.types';

const BASE = '/nha-thau';

export const nhaThauApi = {
  getList: async (params?: NhaThauListParams): Promise<PagedResult<NhaThau>> => {
    const { data } = await nghiepVuAxios.get<ApiWrapped<PagedResult<NhaThau>>>(BASE, { params });
    return data.data;
  },

  getById: async (id: string): Promise<NhaThau> => {
    const { data } = await nghiepVuAxios.get<ApiWrapped<NhaThau>>(`${BASE}/${id}`);
    return data.data;
  },

  create: async (payload: Omit<NhaThau, 'id' | 'ngayTao' | 'ngayCapNhat'>): Promise<NhaThau> => {
    const { data } = await nghiepVuAxios.post<ApiWrapped<NhaThau>>(BASE, payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<NhaThau>): Promise<NhaThau> => {
    const { data } = await nghiepVuAxios.put<ApiWrapped<NhaThau>>(`${BASE}/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await nghiepVuAxios.delete(`${BASE}/${id}`);
  },
};
