import { nghiepVuAxios } from '@/lib/axios';
import type { BaoCaoParams } from '../types/bao-cao.types';

const BASE = '/bao-cao';

export const baoCaoApi = {
  generate: async (params: BaoCaoParams) => {
    const { data } = await nghiepVuAxios.get(`${BASE}/generate`, { params });
    return data;
  },

  exportExcel: async (params: BaoCaoParams): Promise<Blob> => {
    const { data } = await nghiepVuAxios.get(`${BASE}/export/excel`, {
      params,
      responseType: 'blob',
    });
    return data as Blob;
  },

  exportPdf: async (params: BaoCaoParams): Promise<Blob> => {
    const { data } = await nghiepVuAxios.get(`${BASE}/export/pdf`, {
      params,
      responseType: 'blob',
    });
    return data as Blob;
  },
};
