import { nghiepVuAxios } from '@/lib/axios';
import type { ApiWrapped, PagedResult } from '@/types';
import type { KeHoachVon, KeHoachVonListParams } from '../types/ke-hoach-von.types';

const BASE = '/ke-hoach-von';

export const keHoachVonApi = {
  getList: async (params?: KeHoachVonListParams): Promise<PagedResult<KeHoachVon>> => {
    const { data } = await nghiepVuAxios.get<ApiWrapped<PagedResult<KeHoachVon>>>(BASE, { params });
    return data.data;
  },

  getById: async (id: string): Promise<KeHoachVon> => {
    const { data } = await nghiepVuAxios.get<ApiWrapped<KeHoachVon>>(`${BASE}/${id}`);
    return data.data;
  },

  create: async (payload: Omit<KeHoachVon, 'id' | 'ngayTao' | 'ngayCapNhat'>): Promise<KeHoachVon> => {
    const { data } = await nghiepVuAxios.post<ApiWrapped<KeHoachVon>>(BASE, payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<KeHoachVon>): Promise<KeHoachVon> => {
    const { data } = await nghiepVuAxios.put<ApiWrapped<KeHoachVon>>(`${BASE}/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await nghiepVuAxios.delete(`${BASE}/${id}`);
  },
};
