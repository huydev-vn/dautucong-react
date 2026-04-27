import axiosInstance from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { NguoiDung, NguoiDungListParams } from '../types/nguoi-dung.types';

const BASE = '/nguoi-dung';

export const nguoiDungApi = {
  getList: async (params?: NguoiDungListParams): Promise<PaginatedResponse<NguoiDung>> => {
    const { data } = await axiosInstance.get<ApiResponse<PaginatedResponse<NguoiDung>>>(BASE, { params });
    return data.data;
  },

  getById: async (id: string): Promise<NguoiDung> => {
    const { data } = await axiosInstance.get<ApiResponse<NguoiDung>>(`${BASE}/${id}`);
    return data.data;
  },

  create: async (payload: Omit<NguoiDung, 'id' | 'ngayTao' | 'ngayCapNhat'>): Promise<NguoiDung> => {
    const { data } = await axiosInstance.post<ApiResponse<NguoiDung>>(BASE, payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<NguoiDung>): Promise<NguoiDung> => {
    const { data } = await axiosInstance.put<ApiResponse<NguoiDung>>(`${BASE}/${id}`, payload);
    return data.data;
  },

  resetPassword: async (id: string): Promise<void> => {
    await axiosInstance.patch(`${BASE}/${id}/reset-password`);
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE}/${id}`);
  },
};
