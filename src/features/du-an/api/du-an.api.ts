import { nghiepVuAxios } from '@/lib/axios';
import type { ApiWrapped, PagedResult } from '@/types';
import type { DuAn, DuAnListParams } from '../types/du-an.types';

const BASE = '/du-an';

export const duAnApi = {
  getList: async (params?: DuAnListParams): Promise<PagedResult<DuAn>> => {
    const { data } = await nghiepVuAxios.get<ApiWrapped<PagedResult<DuAn>>>(BASE, { params });
    return data.data;
  },

  getById: async (id: string): Promise<DuAn> => {
    const { data } = await nghiepVuAxios.get<ApiWrapped<DuAn>>(`${BASE}/${id}`);
    return data.data;
  },

  create: async (payload: Omit<DuAn, 'id' | 'ngayTao' | 'ngayCapNhat'>): Promise<DuAn> => {
    const { data } = await nghiepVuAxios.post<ApiWrapped<DuAn>>(BASE, payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<DuAn>): Promise<DuAn> => {
    const { data } = await nghiepVuAxios.put<ApiWrapped<DuAn>>(`${BASE}/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await nghiepVuAxios.delete(`${BASE}/${id}`);
  },
};
