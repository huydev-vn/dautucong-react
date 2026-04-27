import axiosInstance from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { DanhMucItem, DanhMucListParams } from '../types/danh-muc.types';

function createDanhMucApi(resource: string) {
  const BASE = `/danh-muc/${resource}`;
  return {
    getList: async (params?: DanhMucListParams): Promise<PaginatedResponse<DanhMucItem>> => {
      const { data } = await axiosInstance.get<ApiResponse<PaginatedResponse<DanhMucItem>>>(BASE, { params });
      return data.data;
    },
    create: async (payload: Omit<DanhMucItem, 'id' | 'ngayTao' | 'ngayCapNhat'>): Promise<DanhMucItem> => {
      const { data } = await axiosInstance.post<ApiResponse<DanhMucItem>>(BASE, payload);
      return data.data;
    },
    update: async (id: string, payload: Partial<DanhMucItem>): Promise<DanhMucItem> => {
      const { data } = await axiosInstance.put<ApiResponse<DanhMucItem>>(`${BASE}/${id}`, payload);
      return data.data;
    },
    delete: async (id: string): Promise<void> => {
      await axiosInstance.delete(`${BASE}/${id}`);
    },
  };
}

export const danhMucNguonVonApi = createDanhMucApi('nguon-von');
export const danhMucLinhVucApi = createDanhMucApi('linh-vuc');
export const danhMucLoaiHopDongApi = createDanhMucApi('loai-hop-dong');
